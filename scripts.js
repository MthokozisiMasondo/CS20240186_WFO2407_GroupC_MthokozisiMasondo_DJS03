import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books

//    PREVIEW OF THE BOOKS 
// The code for previewing books was in different parts of the codebase
// Therefore, I created a class combining all the code related to previewing the list of books
// This decreases repetition and makes it easier to maintain
class BookList {
    constructor(matches, authors, BOOKS_PER_PAGE) {
        this.matches = matches
        this.authors = authors 
        this.BOOKS_PER_PAGE = BOOKS_PER_PAGE 
        this.currentPage = 1
        this.selectors = {
             listButton: '[data-list-button]',
             listItems: '[data-list-items]',
             listActive: '[data-list-active]',
             listBlur: '[data-list-blur]',
             listImage: '[data-list-image]',
             listTitle: '[data-list-title]',
             listSubtitle: '[data-list-subtitle]',
             listDescription: '[data-list-description]'
        }

        this.initialize()
    }

// Calculates the number of books remaining to be displayes
    updateRemainingCount() {
    const remaining = this.matches.length - (this.currentPage * this.BOOKS_PER_PAGE)
    return Math.max(remaining, 0)
}

// Creates a DOM element for a book preview
    createBookPreviewElement({ author, id, image, title }) {
    const element = document.createElement('button')
    element.classList = 'preview'
    element.setAttribute('data-preview', id)

    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${this.authors[author]}</div>
            </div>
        `
    return element
}

// Updates the "show more" button based on remaining books count
    updateShowMoreButton()  {
    const showMoreButton = document.querySelector(this.selectors.listButton)
    const remainingCount = this.updateRemainingCount()

    showMoreButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remainingCount})
    `

    showMoreButton.disabled = remainingCount === 0
}

//
    loadBooks(page) {
      const fragment = document.createDocumentFragment()
      const startIndex = (page - 1) * this.BOOKS_PER_PAGE
      const endIndex = startIndex + this.BOOKS_PER_PAGE

      this.matches
        .slice(startIndex, endIndex)
        .forEach(book => {
            const element = this.createBookPreviewElement(book)
            fragment.appendChild(element)
        })

      document.querySelector(this.selectors.listItems).appendChild(fragment)
    }

// Loads and displays the next page of books and creates book preview elements
    loadMoreBooks() {
        this.loadBooks(this.currentPage)
        this.currentPage += 1
}   

// Preview details
    preview(event) {
        const pathArray = Array.from(event.path || event.composedPath())
        let active = null

       for (const node of pathArray) {
          if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
        if (active) {
            this.showPreviewDetails(active)
        }
    }

// Displaying preview details
    showPreviewDetails(book) {
        document.querySelector(this.selectors.listActive).open = true
        document.querySelector(this.selectors.listBlur).src = book.image
        document.querySelector(this.selectors.listImage).src = book.image
        document.querySelector(this.selectors.listTitle).innerText = book.title
        document.querySelector(this.selectors.listSubtitle).innerText = `
            ${this.authors[book.author]} (${new Date(book.published).getFullYear()})
        `
        document.querySelector(this.selectors.listDescription).innerText = book.description
    }

// Initialize the book list functionality
    initialize() {

      this.loadBooks(this.currentPage)
      this.currentPage += 1

      this.updateShowMoreButton()

    document.querySelector(this.selectors.listButton).addEventListener('click', () => {
        this.loadMoreBooks()
        this.updateShowMoreButton()
    })

    document.querySelector(this.selectors.listItems).addEventListener('click', (event) => {
        this.preview(event)
    })
}
}

// New instance of BookList with provided data
new BookList(matches, authors, BOOKS_PER_PAGE)

//    AUTHOR AND GENRE DROPDOWNS
// Author and genre dropdowns have the same pattern, where the majority of values are similar
// Therefore, I created a function for drowdowns that can be reused for both genre and author drowdowns
// This reduces the code and makes it easier to maintain it
function creatingDropdowns(items, query, text) {
    const createFragment = document.createDocumentFragment()
    const firstElement = document.createElement('option')
    firstElement.value = 'any'
    firstElement.innerText = text
    createFragment.appendChild(firstElement)

    for (const [id, name] of Object.entries(items)) {
        const element = document.createElement('option')
        element.value = id
        element.innerText = name
        createFragment.appendChild(element)
    }

   document.querySelector(query).appendChild(createFragment)

}

creatingDropdowns(genres, '[data-search-genres]', 'All Genres')
creatingDropdowns(authors, '[data-search-authors]', 'All Authors')

//    EVENT LISTENERS FOR OVERLAYS
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

//    THEME HANDLING AND SETTINGS
// Theme handling and settings had repetitive code, in different parts of the codebase
// Therefore I created a class for theme handling and settings, to combine every theme-related code
// This reduces repetitive code and makes it easier to maintain all the theme-related code
class ThemeManager {
    constructor() {
        this.initTheme()
        this.event()
    }

// Applying CSS styling for the theme
  applyTheme(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
  }

// Initializing the theme according to user prefence
  initTheme() {
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const preferedTheme = darkMode ? 'night' : 'day'
    this.applyTheme(preferedTheme)
    document.querySelector('[data-settings-theme]').value = preferedTheme
  }

// Event for theme settings form
  event() {
    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const { theme } = Object.fromEntries(formData)
        this.applyTheme(theme)
        document.querySelector('[data-settings-overlay]').open = false
    })
  }
}

new ThemeManager()

//    SEARCH FUNCTIONALITY   
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})