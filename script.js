/* North Star Bakery | Touchstone 4 | Favorites, validation, and storage */
"use strict";

const bakeryProducts = [
  { id: "signature-loaf", name: "Signature Artisan Loaf", category: "Bread" },
  { id: "morning-pastry", name: "Morning Pastries", category: "Pastry" },
  { id: "celebration-cake", name: "Celebration Cakes", category: "Cake" }
];
const storageKeys = { favorites: "northStarFavorites", customerName: "northStarCustomerName", requestType: "northStarRequestType" };

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.favorites) || "[]");
    return Array.isArray(saved) ? saved.filter(id => bakeryProducts.some(product => product.id === id)) : [];
  } catch (error) { return []; }
}
function saveFavorites(favorites) { localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites)); }
function renderFavorites() {
  const list = document.getElementById("favorite-products");
  if (!list) return;
  const favorites = loadFavorites();
  list.replaceChildren();
  bakeryProducts.forEach(product => {
    const row = document.createElement("div"); row.className = "favorite-row";
    const label = document.createElement("span"); label.textContent = `${product.name} (${product.category})`;
    const button = document.createElement("button"); button.type = "button";
    const selected = favorites.includes(product.id);
    button.textContent = selected ? "Remove favorite" : "Add favorite";
    button.setAttribute("aria-pressed", String(selected));
    button.addEventListener("click", () => toggleFavorite(product.id));
    row.append(label, button); list.append(row);
  });
  document.getElementById("favorites-summary").textContent = favorites.length
    ? `${favorites.length} favorite${favorites.length === 1 ? "" : "s"} saved: ${bakeryProducts.filter(product => favorites.includes(product.id)).map(product => product.name).join(", ")}.`
    : "No favorites saved yet.";
}
function toggleFavorite(id) {
  const favorites = loadFavorites();
  saveFavorites(favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id]);
  renderFavorites();
}
function setupFavorites() {
  if (!document.getElementById("favorite-products")) return;
  document.getElementById("clear-favorites").addEventListener("click", () => { saveFavorites([]); renderFavorites(); });
  renderFavorites();
}

const fieldRules = [
  { id: "customer-name", message: "Enter your full name (at least 2 characters).", valid: value => value.length >= 2 },
  { id: "customer-email", message: "Enter a valid email address, such as name@example.com.", valid: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) },
  { id: "request-type", message: "Choose a request type.", valid: value => value !== "" },
  { id: "item-details", message: "Provide at least 10 characters describing your request.", valid: value => value.length >= 10 }
];
function validateField(rule) {
  const field = document.getElementById(rule.id);
  const valid = rule.valid(field.value.trim());
  document.getElementById(`${rule.id}-error`).textContent = valid ? "" : rule.message;
  field.setAttribute("aria-invalid", String(!valid));
  return valid;
}
function validatePickupDate() {
  const field = document.getElementById("pickup-date");
  const required = document.getElementById("request-type").value === "preorder";
  const valid = !required || (field.value !== "" && field.value >= new Date().toLocaleDateString("en-CA"));
  document.getElementById("pickup-date-error").textContent = valid ? "" : "For a preorder, choose today or a future pickup date.";
  field.setAttribute("aria-invalid", String(!valid));
  return valid;
}
function setupPreorderForm() {
  const form = document.getElementById("preorder-form");
  if (!form) return;
  const name = document.getElementById("customer-name");
  const type = document.getElementById("request-type");
  name.value = localStorage.getItem(storageKeys.customerName) || "";
  type.value = localStorage.getItem(storageKeys.requestType) || "";
  name.addEventListener("input", () => { localStorage.setItem(storageKeys.customerName, name.value); validateField(fieldRules[0]); });
  type.addEventListener("change", () => { localStorage.setItem(storageKeys.requestType, type.value); validateField(fieldRules[2]); validatePickupDate(); });
  fieldRules.filter(rule => rule.id !== "customer-name" && rule.id !== "request-type").forEach(rule => {
    document.getElementById(rule.id).addEventListener("input", () => validateField(rule));
  });
  document.getElementById("pickup-date").addEventListener("change", validatePickupDate);
  form.addEventListener("submit", event => {
    event.preventDefault(); // Classroom demo: do not transmit customer information.
    const results = fieldRules.map(validateField);
    const dateValid = validatePickupDate();
    const status = document.getElementById("form-status");
    if (results.every(Boolean) && dateValid) {
      status.textContent = "Your request is ready to review. This demo does not send orders to the bakery.";
      status.className = "feedback success";
    } else {
      status.textContent = "Please correct the highlighted fields above.";
      status.className = "feedback";
      const invalid = form.querySelector('[aria-invalid="true"]');
      if (invalid) invalid.focus();
    }
  });
}
document.addEventListener("DOMContentLoaded", () => { setupFavorites(); setupPreorderForm(); });
