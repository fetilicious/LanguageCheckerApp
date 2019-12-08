/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import { useInjectReducer } from 'utils/injectReducer';
import { useInjectSaga } from 'utils/injectSaga';
import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';
import H2 from 'components/H2';
import CenteredSection from './CenteredSection';
import TextArea from './TextArea';
import Section from './Section';
import messages from './messages';
import { loadRepos } from '../App/actions';
import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';
import Dropzone from 'react-dropzone';
import InlineSection from './InlineSection';
import ResultArea from "./ResultArea";
import DropzoneSection from "./DropzoneSection";
import DictionaryView from "./DictionaryView";
import TextSection from './TextSection';
const key = 'home';

let allowedWords = ["hello", "world"];
let dict = {};

export function HomePage({
  username,
  loading,
  error,
  repos,
  onSubmitForm
}) {
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  useEffect(() => {
    // When initial state username is not null, submit the form to load repos
    if (username && username.trim().length > 0) onSubmitForm();
  }, []);

  const reposListProps = {
    loading,
    error,
    repos,
  };

  let textArea = React.createRef();
  let resultArea = React.createRef();
  let dictionaryArea = React.createRef();

  function wordCheck() {
    console.log("checking");

    let inputText = textArea.current.textContent;

    let resultHTML = "";
    for (let i = 0; i < inputText.length; i++) {
      if (allowedWords.includes(inputText.substring(i,i+1))){
        resultHTML += inputText.substring(i,i+1);
      } else if (i < inputText.length-1 && allowedWords.includes(inputText.substring(i,i+2))){
        resultHTML += inputText.substring(i,i+2);
        i++;
      } else if (i < inputText.length-2 && allowedWords.includes(inputText.substring(i,i+3))){
        resultHTML += inputText.substring(i,i+3);
        i+=2;
      } else {
        resultHTML += "<b style=\"color:red\">" + inputText.substring(i,i+1) + "</b>";
      }
    }

    let resultText = resultHTML;

    resultArea.current.innerHTML = resultText;
  }

  function parseDictionary(files) {
    files.forEach(file => {
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = () => {
        // Do whatever you want with the file contents
          const text = reader.result;
          let textarray = text.split(/\r?\n/);
          allowedWords = textarray;
          let innerHTML = "";
          allowedWords.forEach(word => {
            innerHTML += word + "<br>";
          })
          dictionaryArea.current.innerHTML = innerHTML;
          console.log(allowedWords);
          window.localStorage.setItem("allowedWords", JSON.stringify(allowedWords));
        };
        reader.readAsText(file);
    });
  }

  let typingTimer;             //timer identifier
  let doneTypingInterval = 1500;  //time in ms, 5 second for example

  function onKeyDown(e) {
    console.log("Keydown");
    clearTimeout(typingTimer);
    typingTimer = setTimeout(wordCheck, doneTypingInterval);
  }

  let autosaveTimerInterval = 5000; // autosave every 5 seconds
  function autoSave() {
    if (!textArea.current) {
      return;
    }
    let inputText = textArea.current.textContent;
    window.localStorage.setItem("autosave", JSON.stringify(inputText));
    setTimeout(autoSave, autosaveTimerInterval);
  }
  setTimeout(autoSave, autosaveTimerInterval);

  // Populate dictionary with previous saved value
  allowedWords = JSON.parse(window.localStorage.getItem("allowedWords"));
  let innerHTML = "";
  allowedWords.forEach(word => {
    innerHTML += word + "<br>";
  });
  
  // Autosave rehydrate
  let autosaveHTML = JSON.parse(window.localStorage.getItem("autosave"));
  if (!autosaveHTML) {
    autosaveHTML = "";
  }

  return (
    <article>
      <Helmet>
        <title>Home Page</title>
        <meta
          name="description"
          content="Language Checker"
        />
      </Helmet>
      <div>
        <CenteredSection>
          <H2>
            <FormattedMessage {...messages.languageAppTitle} />
          </H2>
        </CenteredSection>
        <Section>
          <TextSection>
            <TextArea ref={textArea} contentEditable="true" onKeyDown={onKeyDown} 
            dangerouslySetInnerHTML={{__html: autosaveHTML}}/>
          </TextSection>
          <TextSection>
            <ResultArea ref={resultArea}/>
          </TextSection>
          <InlineSection>
          <Dropzone onDrop={acceptedFiles => parseDictionary(acceptedFiles)}>
            {({getRootProps, getInputProps}) => (
                <div {...getRootProps()}>
                  <DropzoneSection>
                    <div>
                    <input {...getInputProps()} />
                    <p>Upload</p>
                    </div>

                  </DropzoneSection>
                </div>
            )}
          </Dropzone>
          <DictionaryView ref={dictionaryArea} dangerouslySetInnerHTML={{__html: innerHTML}}>
          </DictionaryView>
          </InlineSection>
        </Section>
      </div>
    </article>
  );
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  repos: makeSelectRepos(),
  username: makeSelectUsername(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
});

export function mapDispatchToProps(dispatch) {
  return {
    onChangeUsername: evt => dispatch(changeUsername(evt.target.value)),
    onSubmitForm: evt => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(loadRepos());
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(HomePage);
