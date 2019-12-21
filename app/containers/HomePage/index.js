/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import Dropzone from 'react-dropzone';
import messages from './messages';

import Section from './Section';
import InlineSection from './InlineSection';
import ResultArea from './ResultArea';
import DropzoneSection from './DropzoneSection';
import DictionaryView from './DictionaryView';
import TextSection from './TextSection';
import CenteredSection from './CenteredSection';
import TextArea from './TextArea';
import Banner from './Banner';
import CharacterCountArea from './CharacterCountArea';
import CharacterCountAreaErrors from './CharacterCountAreaErrors';
import FilterInput from './FilterInput';

let allowedWords = [''];

export default function HomePage() {
  const textArea = React.createRef();
  const resultArea = React.createRef();
  const dictionaryArea = React.createRef();
  const charCountArea = React.createRef();
  const charCountAreaErrors = React.createRef();
  const filter = React.createRef();

  function wordCheck() {
    console.log('checking');

    const inputText = textArea.current.innerText;

    let resultHTML = '';
    let errorCount = 0;
    console.log(inputText);
    for (let i = 0; i < inputText.length; i++) {
      if (
        i < inputText.length - 2 &&
        allowedWords.includes(inputText.substring(i, i + 3))
      ) {
        resultHTML += inputText.substring(i, i + 3);
        i += 2;
      } else if (
        i < inputText.length - 1 &&
        allowedWords.includes(inputText.substring(i, i + 2))
      ) {
        resultHTML += inputText.substring(i, i + 2);
        i++;
      } else if (allowedWords.includes(inputText.substring(i, i + 1))) {
        resultHTML += inputText.substring(i, i + 1);
      } else if (inputText[i] === '\n') {
        resultHTML += '<br>';
      } else {
        resultHTML +=
          '<b style="color:red">' + inputText.substring(i, i + 1) + '</b>';
        errorCount++;
      }
    }

    const resultText = resultHTML;

    resultArea.current.innerHTML = resultText;
    charCountArea.current.innerHTML = inputText.length - 1;
    charCountAreaErrors.current.innerHTML = errorCount;
  }

  // Dictionary Parsing
  function parseDictionary(files) {
    files.forEach(file => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        // Do whatever you want with the file contents
        const text = reader.result;
        const textarray = text.split(/\r?\n/);
        allowedWords = textarray;
        let innerHTML = "";
        allowedWords.forEach(word => {
          innerHTML += `${word  }<br>`;
        })
        dictionaryArea.current.innerHTML = innerHTML;
        console.log(allowedWords);
        window.localStorage.setItem("allowedWords", JSON.stringify(allowedWords));
      };
      reader.readAsText(file);
    });
  }

  // Variables for timer
  let typingTimer; // timer identifier
  const doneTypingInterval = 1500; // time in ms

  function filterDictionary() {
    const search = filter.current.value;
    const searchResult = allowedWords.filter(word => word.includes(search));

    let innerHTML = '';
    searchResult.forEach(word => {
      innerHTML += `${word  }<br>`;
    });

    dictionaryArea.current.innerHTML = innerHTML;
  }

  function filterKeyDown(e) {
    if (e.keyCode === 13) {
      filterDictionary();
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(filterDictionary, doneTypingInterval);
  }

  // Key down timer
  function onKeyDown(e) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(wordCheck, doneTypingInterval);
  }
  setTimeout(wordCheck, 1000);

  // Autosave
  const autosaveTimerInterval = 5000; // autosave every 5 seconds
  function autoSave() {
    if (!textArea.current) {
      return;
    }
    const inputText = textArea.current.innerHTML;
    window.localStorage.setItem('autosave', inputText);
    setTimeout(autoSave, autosaveTimerInterval);
  }
  setTimeout(autoSave, autosaveTimerInterval);

  // Populate dictionary with previous saved value
  allowedWords = JSON.parse(window.localStorage.getItem('allowedWords'));
  let innerHTML = '';
  if (allowedWords) {
    allowedWords.forEach(word => {
      innerHTML += `${word  }<br>`;
    });
  }

  // Autosave rehydrate
  let autosaveHTML = window.localStorage.getItem('autosave');
  if (!autosaveHTML) {
    autosaveHTML = '';
  }

  return (
    <article>
      <title>Home Page</title>
      <meta
        name="description"
        content="Language Checker"
      />
      <div>
        <CenteredSection>
          <Banner>Language App</Banner>
        </CenteredSection>
        <Section>
          <TextSection>
            <TextArea
ref={textArea} contentEditable="true" onKeyDown={onKeyDown} 
              dangerouslySetInnerHTML={{__html: autosaveHTML}}/>
            <CharacterCountArea ref={charCountArea}>---</CharacterCountArea>
          </TextSection>
          <TextSection>
            <ResultArea ref={resultArea} />
            <CharacterCountAreaErrors ref={charCountAreaErrors}>
              ---
            </CharacterCountAreaErrors>
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
            <FilterInput ref={filter} onKeyDown={filterKeyDown}/>
            <DictionaryView ref={dictionaryArea} dangerouslySetInnerHTML={{__html: innerHTML}}>
            </DictionaryView>
          </InlineSection>
        </Section>
      </div>
    </article>
  );
}
