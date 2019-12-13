/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

import Section from './Section';
import Dropzone from 'react-dropzone';
import InlineSection from './InlineSection';
import ResultArea from "./ResultArea";
import DropzoneSection from "./DropzoneSection";
import DictionaryView from "./DictionaryView";
import TextSection from './TextSection';
import CenteredSection from './CenteredSection';
import TextArea from './TextArea';
import Banner from './Banner';

let allowedWords = ["hello", "world"];

export default function HomePage() {
  let textArea = React.createRef();
  let resultArea = React.createRef();
  let dictionaryArea = React.createRef();

  function wordCheck() {
    console.log("checking");

    let inputText = textArea.current.innerText;

    let resultHTML = "";
    console.log(inputText);
    for (let i = 0; i < inputText.length; i++) {

      if (i < inputText.length-2 && allowedWords.includes(inputText.substring(i,i+3))){
        resultHTML += inputText.substring(i,i+3);
        i+=2;
      } else if (i < inputText.length-1 && allowedWords.includes(inputText.substring(i,i+2))){
        resultHTML += inputText.substring(i,i+2);
        i++;
      } else if (allowedWords.includes(inputText.substring(i,i+1))){
        resultHTML += inputText.substring(i,i+1);
      } else if (inputText[i] === '\n') {
        resultHTML += "<br>";
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
    let inputText = textArea.current.innerHTML;
    window.localStorage.setItem("autosave", inputText);
    setTimeout(autoSave, autosaveTimerInterval);
  }
  setTimeout(autoSave, autosaveTimerInterval);

  // Populate dictionary with previous saved value
  allowedWords = JSON.parse(window.localStorage.getItem("allowedWords"));
  let innerHTML = "";
  if (allowedWords) {
    allowedWords.forEach(word => {
      innerHTML += word + "<br>";
    });
  }

  // Autosave rehydrate
  let autosaveHTML = window.localStorage.getItem("autosave");
  if (!autosaveHTML) {
    autosaveHTML = "";
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
          <Banner>
            Language App
          </Banner>
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
