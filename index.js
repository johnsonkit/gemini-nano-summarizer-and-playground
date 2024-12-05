import { markdownToHTML, $, enableCopyButton, MESSSAGE_TEXT, countInputText, checkAPIAvailability, debounce } from './helper';

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
    const debouncedUseSummarizerAndTranslationAPI = debounce(useSummarizerAndTranslationAPI, 1000);
    
    textInput.addEventListener('input', async(e) => {        
        countInputText(textInput, characterCount, CHAR_LIMIT);        
        await handleInputBeforeUseSummarizerAndTranslationAPI();
    })

    targetLanguage.addEventListener('change', async(e) => {                
        await handleInputBeforeUseSummarizerAndTranslationAPI();
    })

    enableCopyButton();
    
    async function handleInputBeforeUseSummarizerAndTranslationAPI() {                        
        if (textInput.value.length === 0) {
            resultElement.parentElement.classList.add('hidden');
            return;
        } else if (textInput.value.length > CHAR_LIMIT) {
            resultElement.innerHTML = `<p class="text-gray-500">${MESSSAGE_TEXT.errors.content_too_long}</p>`;
            resultElement.parentElement.classList.remove('hidden');            
            return;
        }                      
        await debouncedUseSummarizerAndTranslationAPI();        
    }

    async function useSummarizerAndTranslationAPI() {        
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
            if (isSupportSummarizerCapabilities) {
                // The Summarizer API can be used immediately
                summarizer = await self.ai.summarizer.create(options);
            } else {
                // The Summarizer API can be used after the model is downloaded
                summarizer = await self.ai.summarizer.create(options);                
                await summarizer.ready;
            }            
            const result = await summarizer.summarize(textInput.value);                                    
            const translator = await self.translation.createTranslator({
                sourceLanguage: 'en',
                targetLanguage: targetLanguage.value,                
            });
            const resultTranslated = await translator.translate(markdownToHTML(result));                                
            resultElement.innerHTML = `<p class="font-normal">Summary:</p><div class=" font-light">${resultTranslated}</div>`;
            
        } catch (error) {
            resultElement.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }        
    }
    
    
        
}) ();

