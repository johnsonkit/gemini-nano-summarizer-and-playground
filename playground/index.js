import { renderBagesHTML, markdownToHTML, $, MESSSAGE_TEXT, enableCopyButton, checkAPIAvailability } from '../helper';

export default (async () => {
    /**
     * DOM Elements
     */
    const isSupportTranslationAPIEl = $('#isSupportTranslationAPI')[0];
    const isSupportAiAPIEl = $('#isSupportAiAPI')[0];
    const isSupportSummarizerAPIEl = $('#isSupportSummarizerAPI')[0];
    const isSupportSummerizerCapabilitiesEl = $('#isSupportSummerizerCapabilities')[0];
    const isSupportPromptAPIEl  = $('#isSupportPromptAPI')[0];
    const isSupportAiModelEl = $('#isSupportAiModel')[0];
    const summarizeTranslateButton = $('#summarizeTranslateButton')[0];
    const translateButton = $('#translateButton')[0];
    const summarizeButton = $('#summarizeButton')[0];
    const promptButton = $('#sendPromptId')[0];        


    /**
     * Check API and Model Availability
     */    
    let {
        isSupportTranslationAPI,
        isSupportAiAPI,
        isSupportSummarizerAPI,
        isSupportPromptAPI,
        isSupportAiModel,
        isSupportSummarizerCapabilities
    } = await checkAPIAvailability();
    
    isSupportTranslationAPIEl.innerHTML = isSupportTranslationAPI ? renderBagesHTML('green', 'Yes') : renderBagesHTML('red', 'No');
    isSupportAiAPIEl.innerHTML = isSupportAiAPI ? renderBagesHTML('green', 'Yes') : renderBagesHTML('red', 'No');
    isSupportSummarizerAPIEl.innerHTML = isSupportSummarizerAPI ? renderBagesHTML('green', 'Yes') : renderBagesHTML('red', 'No');
    isSupportPromptAPIEl.innerHTML = isSupportPromptAPI ? renderBagesHTML('green', 'Yes') : renderBagesHTML('red', 'No');
    isSupportAiModelEl.innerHTML = isSupportAiModel ? renderBagesHTML('green', 'Yes') : renderBagesHTML('red', 'No');
    isSupportSummerizerCapabilitiesEl.innerHTML = isSupportSummarizerCapabilities ? renderBagesHTML('green', 'Yes') : renderBagesHTML('red', 'No');


    /**
     * Event Listeners
     */
    summarizeTranslateButton.addEventListener('click', async(e) => {
        await useSummarizerAndTranslationAPI();
    });

    translateButton.addEventListener('click', async(e) => {
        await useTranslationAPI();
    });

    summarizeButton.addEventListener('click', async(e) => {
        await useSummarizerAPI();
    });

    promptButton.addEventListener('click', async(e) => {
        await usePromptAPI();
    });

    enableCopyButton();

    async function useSummarizerAndTranslationAPI() {
        const summarizeTranslatorInput = $('#summarizeTranslatorInput')[0].value;
        const targetSummarizeTranslatorLanguage = $('#targetSummarizeTranslatorLanguage')[0].value;        
        const resultElement = $('#summarizeTranslatorResult')[0];
        resultElement.parentElement.classList.remove('hidden');
        resultElement.innerHTML = `<p class="text-gray-500">${MESSSAGE_TEXT.summarizing_and_translating}</p>`;

        try {
            if (!isSupportSummarizerAPI) {
                resultElement.innerHTML = `<p class="text-red-500">${MESSSAGE_TEXT.errors.summarizer_api_not_available}</p>`;
                return;
            }
            if (!isSupportTranslationAPI) {
                resultElement.innerHTML = `<p class="text-red-500">${MESSSAGE_TEXT.errors.translation_api_not_available}</p>`;
                return;
            }
            summarizeTranslateButton.disabled = true;  
            const available = (await self.ai.summarizer.capabilities()).available;
            let summarizer;
            const options = {        
                type: 'key-points',
                format: 'markdown',
                length: 'long',
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                    });
                }
            };            
            if (available === 'readily') {
                // The Summarizer API can be used immediately
                summarizer = await self.ai.summarizer.create(options);
            } else {
                // The Summarizer API can be used after the model is downloaded
                summarizer = await self.ai.summarizer.create(options);                
                await summarizer.ready;
            }            
            const result = await summarizer.summarize(summarizeTranslatorInput);        
                                    
            const translator = await self.translation.createTranslator({
                sourceLanguage: 'en',
                targetLanguage: targetSummarizeTranslatorLanguage,                
            });
            const resultTranslated = await translator.translate(markdownToHTML(result));                    
            
            resultElement.innerHTML = `<p class="font-normal">Summary:</p><div class=" font-light">${resultTranslated}</div>`;

            summarizeTranslateButton.disabled = false;  
            
        } catch (error) {
            resultElement.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }        
    }
    
    async function usePromptAPI() {    
    
      const input = $('#promptInput')[0].value;
      const chatMessages = $('#chatMessages')[0];
      const sendPromptBtn = $('#sendPromptId')[0];
      const promptBtnText = ['Send', 'Processing...'];
      
      if (!isSupportPromptAPI) {
          console.error('Prompt API session is not initialized.');
          chatMessages.innerHTML += `<p class="text-red-500">${MESSSAGE_TEXT.errors.prompt_api_not_available}</p>`;
          return;
      }
    
      chatMessages.innerHTML += `<p class="mb-2"><strong>You:</strong> ${input}</p>`;
      
      try {
            sendPromptBtn.disabled = true;  
            sendPromptBtn.innerText = promptBtnText[1];
            const session = await ai.languageModel.create();
            const result = await session.prompt(input);            
          
            // Display AI result        
            chatMessages.innerHTML += `<div class="mb-2 flex gap-1">
                <div><strong>AI:</strong></div>
                <div>${markdownToHTML(result)}</div>
            </div>`;

            sendPromptBtn.disabled = false;
            sendPromptBtn.innerText = promptBtnText[0];          
        
      } catch (error) {
          chatMessages.innerHTML += `<p class="text-red-500">Error: ${error.message}</p>`;
      }
    
      // Clear input field and scroll to bottom
      $('#promptInput')[0].value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
    
    }        
    
    
    async function useSummarizerAPI() {
      const input = $('#summarizerInput')[0].value;
      const optionType = $('#summarizeType')[0].value;
      const optionFormat = $('#summarizeFormat')[0].value;
      const optionLength = $('#summarizeLength')[0].value;
      const resultElement = $('#summarizerResult')[0];
      resultElement.parentElement.classList.remove('hidden');
      resultElement.innerHTML = `<p class="text-gray-500">${MESSSAGE_TEXT.summarizing}</p>`;
    
      if (!isSupportSummarizerAPI) {
        console.log('Summarizer API session is not initialized.');
        
          resultElement.innerHTML = `<p class="text-red-500">${MESSSAGE_TEXT.errors.summarizer_api_not_available}</p>`;
          return;
      }
      
    
    try {
        summarizeButton.disabled = true;
        const available = (await self.ai.summarizer.capabilities()).available;
        let summarizer;
        const options = {        
            type: optionType,
            format: optionFormat,
            length: optionLength,
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                });
            }
        };
        if (available === 'no') {
            console.log('Summarizer cababilities are not available.');
            // The Summarizer API isn't usable.
            resultElement.innerHTML = `<p class="text-red-500">${MESSSAGE_TEXT.errors.summarizer_capabilities_not_available}</p>`;
            return;
        }
        if (available === 'readily') {
            // The Summarizer API can be used immediately .
            summarizer = await self.ai.summarizer.create(options);
        } else {
            // The Summarizer API can be used after the model is downloaded.
            summarizer = await self.ai.summarizer.create(options);
            // summarizer.addEventListener('downloadprogress', (e) => {
            //     console.log(e.loaded, e.total);
            // });
            await summarizer.ready;
        }        
        const result = await summarizer.summarize(input);                             
        resultElement.innerHTML = `<p class="font-normal">Summary:</p><div class="font-light">${markdownToHTML(result)}</div>`;
        summarizeButton.disabled = false;
        } catch (error) {
            resultElement.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
            console.log('Summarizer error:', error);
            
        }
    }
    
    
    async function useTranslationAPI() {
        const translatorInput = $('#translatorInput')[0].value;
        const targetLang = $('#targetLanguage')[0].value;
        const resultElement = $('#translatorResult')[0];        
        resultElement.parentElement.classList.remove('hidden');
        resultElement.innerHTML = `<p class="text-gray-500">${MESSSAGE_TEXT.translating}</p>`;
    
        if (!isSupportTranslationAPI) {
            resultElement.innerHTML = `<p class="text-red-500">${MESSSAGE_TEXT.errors.translation_api_not_available}</p>`;
            return;
        }
    
        try {
            translateButton.disabled = true;
            const translator = await self.translation.createTranslator({
                sourceLanguage: 'en',
                targetLanguage: targetLang,            
            });
            const result = await translator.translate(translatorInput.replace(/\n/g, '<br>'));                                              
            resultElement.innerHTML = `<div class="font-light">${result}</div>`;          
            translateButton.disabled = false;
        } catch (error) {
            resultElement.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
            console.error('Translation error:', error);
        }
    }
                
}) ();

