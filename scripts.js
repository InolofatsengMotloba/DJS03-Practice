import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

function createElement(tag, className, attributes = {}, innerHTML = '') {
  const element = document.createElement(tag);
  element.className = className;

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }

  element.innerHTML = innerHTML;
  return element;
}

function createPreviewButton({ id, image, title, author }) {
  const innerHTML = `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
        <h3 class="preview__title">${title}</h3>
        <div class="preview__author">${authors[author]}</div>
    </div>
  `;

  return createElement('button', 'preview', { 'data-preview': id }, innerHTML);
}

function appendElementsToContainer(containerSelector, elements) {
  const container = document.querySelector(containerSelector);
  const fragment = document.createDocumentFragment();

  elements.forEach(element => fragment.appendChild(element));
  container.appendChild(fragment);
}

function generatePreviews(matches, limit, containerSelector) {
  const elements = matches.slice(0, limit).map(createPreviewButton);
  appendElementsToContainer(containerSelector, elements);
}

// Usage
generatePreviews(matches, BOOKS_PER_PAGE, '[data-list-items]');


// Function to create an option element
function createOptionElement(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.innerText = text;
  return option;
}

// Function to append options to a document fragment
function appendOptionsToFragment(fragment, options) {
  options.forEach(option => fragment.appendChild(option));
}

// Function to generate genre options and append to the dropdown menu
function generateGenreOptions() {
  const fragment = document.createDocumentFragment();
  
  // Create and append the "All Genres" option
  const allGenresOption = createOptionElement("any", "All Genres");
  fragment.appendChild(allGenresOption);
  
  // Create and append options for each genre
  const genreOptions = Object.entries(genres).map(([id, name]) => createOptionElement(id, name));
  appendOptionsToFragment(fragment, genreOptions);
  
  // Append the document fragment to the dropdown menu in the DOM
  document.querySelector("[data-search-genres]").appendChild(fragment);
}

// Usage
generateGenreOptions();


// Create a document fragment to hold generated author options
const authorsHtml = document.createDocumentFragment();

// Create the first option element representing "All Authors"
const firstAuthorElement = document.createElement("option");
firstAuthorElement.value = "any"; // Set value attribute to 'any'
firstAuthorElement.innerText = "All Authors"; // Set text content to 'All Authors'

// Append the first option to the document fragment
authorsHtml.appendChild(firstAuthorElement);

// Loop through each author in the 'authors' object
for (const [id, name] of Object.entries(authors)) {
  // Create an option element for each author
  const element = document.createElement("option");
  // Set the value attribute to the author's id
  element.value = id;
  // Set the text content to the author's name
  element.innerText = name;
  // Append the author option to the document fragment
  authorsHtml.appendChild(element);
}

// Append the generated author options to the dropdown menu in the DOM
document.querySelector("[data-search-authors]").appendChild(authorsHtml);

// Function to apply theme settings
function applyTheme(theme, darkColor, lightColor) {
  document.querySelector("[data-settings-theme]").value = theme;
  document.documentElement.style.setProperty("--color-dark", darkColor);
  document.documentElement.style.setProperty("--color-light", lightColor);
}

// Function to determine and set the preferred theme
function setPreferredTheme() {
  const prefersDarkScheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDarkScheme) {
    applyTheme("night", "255, 255, 255", "10, 10, 20");
  } else {
    applyTheme("day", "10, 10, 20", "255, 255, 255");
  }
}

// Usage
setPreferredTheme();


// Updating the UI and handling user interactions on the webpage
// Update Show More Button Text and Disable Logic
function updateShowMoreButton() {
  const end = (page + 1) * BOOKS_PER_PAGE;
  const remaining = matches.length - end;
  document.querySelector("[data-list-button]").disabled = remaining <= 0;
  document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>
    `;
}

updateShowMoreButton()

// Add event listener for search overlay cancel button
document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

// Add event listener for settings overlay cancel button
document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });

// Add event listener for header search button
document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

// Add event listener for header settings button
document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
  });

// Add event listener for list close button
document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

// Add event listener for form submission on the settings form
document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    // Prevent the default form submission behavior which causes page reload
    event.preventDefault();

    // Extract form data
    const formData = new FormData(event.target);

    // Convert form data to object and extract the 'theme' field value
    const { theme } = Object.fromEntries(formData);

    // Check the selected theme
    if (theme === "night") {
      // If night theme is selected, set dark color variables to light values
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      // If day theme is selected, set dark color variables to dark values
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }

    // Close the settings overlay after form submission
    document.querySelector("[data-settings-overlay]").open = false;
  });

// Add event listener for form submission on the search form
document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    // Prevent the default form submission behavior which causes page reload
    event.preventDefault();

    // Extract form data
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);

    // Array to hold filtered books
    const result = [];

    // Loop through each book to filter based on search criteria
    for (const book of books) {
      let genreMatch = filters.genre === "any";

      // Check if the book's genres match the selected genre filter
      for (const singleGenre of book.genres) {
        if (genreMatch) break;
        if (singleGenre === filters.genre) {
          genreMatch = true;
        }
      }

      // Check if the book matches search criteria
      if (
        (filters.title.trim() === "" ||
          book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === "any" || book.author === filters.author) &&
        genreMatch
      ) {
        result.push(book); // Add book to result array if it matches criteria
      }
    }

    // Update pagination variables and book matches
    page = 1;
    matches = result;

    // Show or hide message if no results found
    if (result.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    // Clear existing items in the list
    document.querySelector("[data-list-items]").innerHTML = "";
    const newItems = document.createDocumentFragment();

    // Create new list items for the filtered books
    for (const { author, id, image, title } of result.slice(
      0,
      BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);

      // Fill in the HTML for the list item
      element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

      newItems.appendChild(element); // Append the new list item to the fragment
    }

    // Append new list items to the list container
    document.querySelector("[data-list-items]").appendChild(newItems);

    // Update Show More button
    document.querySelector("[data-list-button]").disabled =
      matches.length - page * BOOKS_PER_PAGE < 1;
    document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>
    `;

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Close the search overlay after form submission
    document.querySelector("[data-search-overlay]").open = false;
  });

// Add event listener for click on the "Show more" button
document.querySelector("[data-list-button]").addEventListener("click", () => {
  // Create a document fragment to hold the newly created elements
  const fragment = document.createDocumentFragment();

  // Loop through a portion of the 'matches' array to create book previews for the next page
  for (const { author, id, image, title } of matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  )) {
    // Create a button element for each book preview
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    // Fill in the HTML for the book preview
    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

    // Append the newly created book preview element to the fragment
    fragment.appendChild(element);
  }

  // Append the fragment containing the new book previews to the list container
  document.querySelector("[data-list-items]").appendChild(fragment);
  // Increment the 'page' variable to load the next page of book previews next time the button is clicked
  page += 1;
});

// Add event listener to the list items container
document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    // Convert event.path or event.composedPath() to an array for compatibility
    const pathArray = Array.from(event.path || event.composedPath());

    // Initialize variable to hold the clicked book details
    let active = null;

    // Iterate through the pathArray to find the clicked book
    for (const node of pathArray) {
      if (active) break;

      // Check if the clicked element has a 'data-preview' attribute
      if (node?.dataset?.preview) {
        let result = null;

        // Find the book in the 'books' array using its id
        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result; // Set the clicked book details
      }
    }

    // If a book is clicked
    if (active) {
      // Open the modal or overlay to display book details
      document.querySelector("[data-list-active]").open = true;

      // Update modal content with book details
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  });
