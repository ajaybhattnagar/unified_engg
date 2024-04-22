import { TextEditor } from 'handsontable/editors/textEditor';

export class LabNotes extends TextEditor {
    createElements() {
        super.createElements();

        this.TEXTAREA = document.createElement('input');
        this.TEXTAREA.setAttribute('placeholder', 'Custom placeholder');
        this.TEXTAREA.setAttribute('data-hot-input', true);
        this.textareaStyle = this.TEXTAREA.style;
        this.TEXTAREA_PARENT.innerText = '';
        this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
        // Limit text area to 25 characters
        this.TEXTAREA.maxLength = 25;

        // Do not allow quote and double quote
        this.TEXTAREA.addEventListener('keypress', (e) => {
            if (e.key === '"' || e.key === "'") {
                e.preventDefault();
            }
        });
    }
}

export class QaNotes extends TextEditor {
    createElements() {
        super.createElements();

        this.TEXTAREA = document.createElement('input');
        this.TEXTAREA.setAttribute('placeholder', 'Custom placeholder');
        this.TEXTAREA.setAttribute('data-hot-input', true);
        this.textareaStyle = this.TEXTAREA.style;
        this.TEXTAREA_PARENT.innerText = '';
        this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
        // Limit text area to 255 characters
        this.TEXTAREA.maxLength = 255;

        // Do not allow quote and double quote
        this.TEXTAREA.addEventListener('keypress', (e) => {
            if (e.key === '"' || e.key === "'") {
                e.preventDefault();
            }
        });
    }
}