// app.js
document.addEventListener('DOMContentLoaded', () => {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const contextMenu = document.getElementById('context-menu');
    let selectedElement = null;
    let currentManager = null;

    class ElementManager {
        constructor(type) {
            this.type = type;
            this.container = document.getElementById(`${type}-container`);
            this.elements = [];
            this.loadState();
        }

        createElement(x, y) {
            const element = this.type === 'note' ? this.createNote(x, y) : this.createBook(x, y);
            this.setupInteractions(element);
            this.elements.push(element);
            this.container.appendChild(element);
            this.saveState();
            return element;
        }

        createNote(x, y) {
            const note = document.createElement('div');
            note.className = 'note-component';
            note.style.left = `${x}px`;
            note.style.top = `${y}px`;
            note.innerHTML = `
                <svg width="180" height="180">
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.85)" stroke="#fff" stroke-width="2"/>
                    <foreignObject x="10" y="10" width="160" height="160">
                        <div contenteditable class="note-content">Nueva nota</div>
                    </foreignObject>
                </svg>
            `;
            return note;
        }

        createBook(x, y) {
            const book = document.createElementNS(SVG_NS, 'rect');
            book.classList.add('book-component');
            book.setAttribute('x', x);
            book.setAttribute('y', y);
            book.setAttribute('width', '80');
            book.setAttribute('height', '120');
            book.setAttribute('fill', 'none');
            book.setAttribute('stroke', '#fff');
            book.setAttribute('stroke-width', '2');
            return book;
        }

        setupInteractions(element) {
            interact(element).draggable({
                listeners: {
                    move: event => {
                        const dx = event.dx, dy = event.dy;
                        if (this.type === 'note') {
                            element.style.left = `${parseFloat(element.style.left) + dx}px`;
                            element.style.top = `${parseFloat(element.style.top) + dy}px`;
                        } else {
                            element.setAttribute('x', parseFloat(element.getAttribute('x')) + dx);
                            element.setAttribute('y', parseFloat(element.getAttribute('y')) + dy);
                        }
                    },
                    end: () => this.saveState()
                }
            });

            element.addEventListener('contextmenu', e => {
                e.preventDefault();
                selectedElement = element;
                currentManager = this;
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
            });
        }

        saveState() {
            const state = this.elements.map(el => ({
                x: this.type === 'note' ? parseFloat(el.style.left) : parseFloat(el.getAttribute('x')),
                y: this.type === 'note' ? parseFloat(el.style.top) : parseFloat(el.getAttribute('y'))
            }));
            localStorage.setItem(this.type, JSON.stringify(state));
        }

        loadState() {
            const saved = JSON.parse(localStorage.getItem(this.type)) || [];
            saved.forEach(pos => this.createElement(pos.x, pos.y));
        }

        deleteElement(element) {
            const index = this.elements.indexOf(element);
            if (index > -1) {
                this.elements.splice(index, 1);
                element.remove();
                this.saveState();
            }
        }
    }

    // Inicialización
    const notesManager = new ElementManager('note');
    const booksManager = new ElementManager('book');

    // Eventos de botones
    document.getElementById('add-note').addEventListener('click', () => {
        notesManager.createElement(
            Math.random() * (window.innerWidth - 200),
            Math.random() * (window.innerHeight - 200)
        );
    });

    document.getElementById('add-book').addEventListener('click', () => {
        booksManager.createElement(
            Math.random() * (window.innerWidth - 100),
            Math.random() * (window.innerHeight - 150)
        );
    });

    // Menú contextual
    contextMenu.innerHTML = '<div class="context-menu-item" data-action="delete">Eliminar</div>';
    
    document.addEventListener('click', e => {
        if (!e.target.closest('#context-menu')) contextMenu.style.display = 'none';
    });

    contextMenu.addEventListener('click', e => {
        if (e.target.dataset.action === 'delete') {
            currentManager.deleteElement(selectedElement);
            contextMenu.style.display = 'none';
        }
    });
});