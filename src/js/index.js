import Search from "./models/search";
import * as SearchView from "./views/searchView";
import { elements, renderLoader, cleanLoader } from "./views/base";
import Recipe from "./models/recipe";
import * as RecipeView from "./views/recipeView";
import List from "./models/list";
import * as ListView from "./views/listView";
import Likes from "./models/like";
import * as LikeView from "./views/likeView";

/* Global state of the app

* - Search object
* - Current recipe object
* - Shopping list objects
* - Liked recipes

*/

const state = {};

/*
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
  // Get query from view
  const query = SearchView.getInput();

  if (query) {
    // New Search object
    state.Search = new Search(query);

    // Prepare UI for results
    SearchView.clearInput();
    SearchView.clearResults();
    renderLoader(elements.searchResult);

    try {
      // Search for recipes
      await state.Search.getResults();

      // Render results on UI
      cleanLoader();
      SearchView.renderResults(state.Search.results);
    } catch (error) {
      alert("Something went wrong with the search!");
      cleanLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  controlSearch();
});

elements.searchResultPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    SearchView.clearResults();
    SearchView.renderResults(state.Search.results, goToPage);
  }
});

/*
 * SEARCH CONTROLLER
 */

/*
 * LIST CONTROLLER
 */

const controlList = () => {
  // Create a new List if there is none yet
  if (!state.List) state.List = new List();

  // Add each ingredient to the list and UI
  state.Recipe.ingredients.forEach((el) => {
    const item = state.List.addItem(el.count, el.unit, el.ingredient);
    ListView.renderItem(item);
  });
};

// Handle delete and update list item events
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // Handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // Delete from state
    state.List.deleteItem(id);

    // Delete from UI
    ListView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    // Handle the count update
    const val = parseInt(e.target.value, 10);
    state.List.updateCount(id, val);
  }
});

/*
 * LIST CONTROLLER
 */

/*
 * LIKE CONTROLLER
 */

const controlLike = () => {
  if (!state.Likes) state.Likes = new Likes();
  const currentId = state.Recipe.id;

  // User has not yet liked current recipe
  if (!state.Likes.isLiked(currentId)) {
    // Add like to the state
    const newLike = state.Likes.addLike(
      currentId,
      state.Recipe.title,
      state.Recipe.author,
      state.Recipe.image
    );
    // toggle the like button
    LikeView.toggleLikeButton(true);
    // Add like to UI list
    LikeView.renderLike(newLike);
  } else {
    // User has liked the current recipe
    // Remove like from the state
    state.Likes.deleteLike(currentId);
    // toggle the like button
    LikeView.toggleLikeButton(false);
    // Remove like from UI list
    LikeView.deleteLike(currentId);
  }

  LikeView.toggleLikeMenu(state.Likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener("load", () => {
  state.Likes = new Likes();

  // Restore likes
  state.Likes.readStorage();

  // Toggle like menu button
  LikeView.toggleLikeMenu(state.Likes.getNumLikes());

  // Render the existing likes
  state.Likes.likes.forEach((like) => {
    LikeView.renderLike(like);
  });
});

/*
 * LIKE CONTROLLER
 */

/*
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for changes
    RecipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (state.Search) SearchView.highlightSelected(id);

    // Create new recipe object
    state.Recipe = new Recipe(id);

    try {
      // Get recipe data and parse ingredients
      await state.Recipe.getRecipe();
      state.Recipe.parseIngredients();

      // Calculate time and servings
      state.Recipe.calcTime();
      state.Recipe.calcServings();

      // Render recipe
      cleanLoader();
      RecipeView.renderRecipe(state.Recipe, state.Likes.isLiked(id));
    } catch (error) {
      alert("Error processing recipe!");
    }
  }
};

//window.addEventListener("hashchange", controlRecipe);
//window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

// Handling recipe button clicks

elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button is clicked
    if (state.Recipe.servings > 1) {
      state.Recipe.updateServings("dec");
      RecipeView.updateServingsIngredients(state.Recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button is clicked
    state.Recipe.updateServings("inc");
    RecipeView.updateServingsIngredients(state.Recipe);
  } else if (e.target.matches(".recipe__btn-add, .recipe__btn-add *")) {
    // Add ingredients to the shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // Like controller
    controlLike();
  }
});

/*
 * RECIPE CONTROLLER
 */
