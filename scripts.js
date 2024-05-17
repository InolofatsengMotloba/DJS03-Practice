import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

function createElement(tag, className, attributes = {}, innerHTML = "") {
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

  return createElement("button", "preview", { "data-preview": id }, innerHTML);
}

function appendElementsToContainer(containerSelector, elements) {
  const container = document.querySelector(containerSelector);
  const fragment = document.createDocumentFragment();

  elements.forEach((element) => fragment.appendChild(element));
  container.appendChild(fragment);
}

function generatePreviews(matches, limit, containerSelector) {
  const elements = matches.slice(0, limit).map(createPreviewButton);
  appendElementsToContainer(containerSelector, elements);
}

// Usage
generatePreviews(matches, BOOKS_PER_PAGE, "[data-list-items]");

// Function to create an option element
function createOptionElement(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.innerText = text;
  return option;
}

// Function to append options to a document fragment
function appendOptionsToFragment(fragment, options) {
  options.forEach((option) => fragment.appendChild(option));
}

// Function to generate genre options and append to the dropdown menu
function generateGenreOptions() {
  const fragment = document.createDocumentFragment();

  // Create and append the "All Genres" option
  const allGenresOption = createOptionElement("any", "All Genres");
  fragment.appendChild(allGenresOption);

  // Create and append options for each genre
  const genreOptions = Object.entries(genres).map(([id, name]) =>
    createOptionElement(id, name)
  );
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
  const prefersDarkScheme =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
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

updateShowMoreButton();

// Function to add event listeners for various elements
function addEventListeners() {
  // Search overlay cancel button
  document
    .querySelector("[data-search-cancel]")
    .addEventListener("click", () => {
      toggleOverlay("[data-search-overlay]", false);
    });

  // Settings overlay cancel button
  document
    .querySelector("[data-settings-cancel]")
    .addEventListener("click", () => {
      toggleOverlay("[data-settings-overlay]", false);
    });

  // Header search button
  document
    .querySelector("[data-header-search]")
    .addEventListener("click", () => {
      toggleOverlay("[data-search-overlay]", true);
      document.querySelector("[data-search-title]").focus();
    });

  // Header settings button
  document
    .querySelector("[data-header-settings]")
    .addEventListener("click", () => {
      toggleOverlay("[data-settings-overlay]", true);
    });

  // List close button
  document.querySelector("[data-list-close]").addEventListener("click", () => {
    toggleOverlay("[data-list-active]", false);
  });
}

// Function to toggle overlay visibility
function toggleOverlay(selector, isOpen) {
  document.querySelector(selector).open = isOpen;
}

// Call the function to add event listeners
addEventListeners();

// Function to handle form submission on the settings form
function handleSettingsFormSubmission() {
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

      // Update color variables based on the selected theme
      updateColorVariables(theme);

      // Close the settings overlay after form submission
      toggleOverlay("[data-settings-overlay]", false);
    });
}

// Function to update color variables based on the selected theme
function updateColorVariables(theme) {
  // Define color values based on the selected theme
  const darkColor = theme === "night" ? "255, 255, 255" : "10, 10, 20";
  const lightColor = theme === "night" ? "10, 10, 20" : "255, 255, 255";

  // Update color variables in the document
  document.documentElement.style.setProperty("--color-dark", darkColor);
  document.documentElement.style.setProperty("--color-light", lightColor);
}

// Call the function to handle form submission on the settings form
handleSettingsFormSubmission();

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

// Function to handle click event on the preview button
function previewBookDetails() {
  document.querySelector("[data-list-button]").addEventListener("click", () => {
    const fragment = createBookPreviewsFragment(); // Create a fragment containing book previews for the next page
    appendBookPreviews(fragment); // Append the fragment to the list container
    incrementPage(); // Increment the 'page' variable to load the next page of book previews
  });
}

// Function to create a fragment containing book previews for the next page
function createBookPreviewsFragment() {
  const fragment = document.createDocumentFragment();
  const startIndex = page * BOOKS_PER_PAGE;
  const endIndex = (page + 1) * BOOKS_PER_PAGE;

  for (const { author, id, image, title } of matches.slice(
    startIndex,
    endIndex
  )) {
    const element = createPreviewButtonElement({ id, image, title, author }); // Create a button element for each book preview
    fragment.appendChild(element); // Append the book preview element to the fragment
  }

  return fragment;
}

// Function to create a button element for a book preview
function createPreviewButtonElement({ id, image, title, author }) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);
  element.innerHTML = `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
        <h3 class="preview__title">${title}</h3>
        <div class="preview__author">${authors[author]}</div>
    </div>
  `;
  return element;
}

// Function to append book previews fragment to the list container
function appendBookPreviews(fragment) {
  document.querySelector("[data-list-items]").appendChild(fragment);
}

// Function to increment the 'page' variable
function incrementPage() {
  page += 1;
}

// Call the function to handle click event on the preview button
previewBookDetails();

// Add event listener to the list items container
// Function to handle click event on list items
function handleListItemClick(event) {
  const clickedBook = findClickedBook(event); // Find the clicked book details
  if (clickedBook) {
    openModalWithBookDetails(clickedBook); // Open modal with book details
    updateModalContent(clickedBook); // Update modal content with book details
  }
}

// Function to find the clicked book details
function findClickedBook(event) {
  const pathArray = Array.from(event.path || event.composedPath()); // Convert event.path or event.composedPath() to an array for compatibility

  for (const node of pathArray) {
    if (node?.dataset?.preview) {
      return books.find((book) => book.id === node.dataset.preview); // Find the clicked book in the 'books' array using its id
    }
  }

  return null;
}

// Function to open modal with book details
function openModalWithBookDetails() {
  document.querySelector("[data-list-active]").open = true; // Open the modal or overlay to display book details
}

// Function to update modal content with book details
function updateModalContent(book) {
  const { image, title, author, published, description } = book;
  document.querySelector("[data-list-blur]").src = image;
  document.querySelector("[data-list-image]").src = image;
  document.querySelector("[data-list-title]").innerText = title;
  document.querySelector("[data-list-subtitle]").innerText = `${
    authors[author]
  } (${new Date(published).getFullYear()})`;
  document.querySelector("[data-list-description]").innerText = description;
}

// Call the function to handle click event on list items
document
  .querySelector("[data-list-items]")
  .addEventListener("click", handleListItemClick);
