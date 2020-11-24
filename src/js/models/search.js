import axios from "axios";

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    const res = await axios(
      `https://forkify-api.herokuapp.com/api/search?&q=${this.query}`
    );
    this.results = res.data.recipes;
  }
}
