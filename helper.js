import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const MESSSAGE_TEXT = {
    errors: {
        ai_api_not_available: 'Error: AI APIs are not available in this environment.',
        translation_api_not_available: 'Error: Translation API is not available in this environment.',
        prompt_api_not_available: 'Error: Prompt API is not available in this environment.',
        summarizer_api_not_available: 'Error: Summarizer API is not available in this environment.',
        summarizer_capabilities_not_available: 'Error: Summarizer capabilities are not available in this environment.',
        content_too_long: 'Error: Content is too long.',
    },
    summarizing_and_translating: 'Summarizing and translating content...',
    summarizing: 'Summarizing content...',
    translating: 'Translating content...'
}

export function $(selector='') {
    return document.querySelectorAll(selector);
}

export async function checkAPIAvailability() {
    let isSupportTranslationAPI = 'translation' in self && 'createTranslator' in self.translation;
    let isSupportAiAPI = 'ai' in self && 'languageModel' in self.ai;
    let isSupportSummarizerAPI = 'ai' in self && 'summarizer' in self.ai;
    let isSupportPromptAPI = 'ai' in self && 'languageModel' in self.ai;
    const { available: aiModelAvailable } = await ai.languageModel.capabilities();  
    let isSupportAiModel = aiModelAvailable === 'readily';
    const { available: summarizerCapabilities } = await self.ai.summarizer.capabilities();
    let isSupportSummarizerCapabilities = summarizerCapabilities === 'readily';
    return {
        isSupportTranslationAPI,
        isSupportAiAPI,
        isSupportSummarizerAPI,
        isSupportPromptAPI,
        isSupportAiModel,
        isSupportSummarizerCapabilities
    }
}

export function numberWithCommas(number) {    
    if (number < 1000) {
        return number;
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function countInputText(inputEl, displayEl, charLimit=5000) {
    let charCount = inputEl.value.length;                
    displayEl.textContent = `${numberWithCommas(charCount)} / ${numberWithCommas(charLimit)}`;         
}

export function enableCopyButton(selector='.copy-button') {
    document.querySelectorAll(selector).forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();            
            const elementId = button.getAttribute('data-element-id');            
            copyText(elementId);
        });
    })    
}

  
export function renderBagesHTML(color, text) {
    if (color == 'red') {
        return `<span class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-normal text-red-700 ring-1 ring-inset ring-red-600/10">${text}</span>`
    } else if (color == 'green') {
        return `<span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-normal text-green-700 ring-1 ring-inset ring-green-600/20">${text}</span>`
    } else {
        return `<span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-normal text-gray-600 ring-1 ring-inset ring-gray-500/10">${text}</span>`
    }
}

export function markdownToHTML(markdown='') {
    if (!markdown) { return ''; }    
    return DOMPurify.sanitize(marked.parse(markdown));
}

  
export function copyText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return;
    }
    const text = element.innerText;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    } else {
        // Fallback for browsers that don't support the Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Text copied to clipboard (fallback method)');
    }
}