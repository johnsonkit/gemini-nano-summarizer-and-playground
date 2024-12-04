import { markdownToHTML, $, enableCopyButton, MESSSAGE_TEXT, countInputText, checkAPIAvailability } from './helper';

export default (async () => {
    /**
     * Variables
     */
    const CHAR_LIMIT = 5000;  


    /**
     * DOM Elements
     */
    const textInput = $('#textInput')[0];
    const targetLanguage = $('#targetLanguage')[0];    
    const resultElement = $('#result')[0];
    const characterCount = $('#characterCount')[0];    


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
    

    /**
     * Event Listeners
     */
    textInput.addEventListener('input', async(e) => {        
        countInputText(textInput, characterCount, CHAR_LIMIT);        
        
        if (textInput.value.length > 0 && textInput.value.length <= CHAR_LIMIT) {            
            await useSummarizerAndTranslationAPI();
        } else {
            resultElement.parentElement.classList.remove('hidden');
            resultElement.innerHTML = `<p class="text-gray-500">${MESSSAGE_TEXT.errors.content_too_long}</p>`
        }
    })

    targetLanguage.addEventListener('change', async(e) => {        
        
        if (textInput.value.length > 0 && textInput.value.length <= CHAR_LIMIT) {
            await useSummarizerAndTranslationAPI();                    
        } else {
            resultElement.parentElement.classList.remove('hidden');
            resultElement.innerHTML = `<p class="text-gray-500">${MESSSAGE_TEXT.errors.content_too_long}</p>`
        }
    })

    enableCopyButton();

    async function useSummarizerAndTranslationAPI() {
        const summarizeTranslatorInput = $('#textInput')[0].value;
        const targetSummarizeTranslatorLanguage = $('#targetLanguage')[0].value;        
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
            
        } catch (error) {
            resultElement.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }        
    }
    
    
        
}) ();

