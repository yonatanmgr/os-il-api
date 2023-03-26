API for [opensource-il](https://opensource-il.vercel.app/).

## Routes

- `/api/reposdb` - Returns a list of repositories, scraped from [the projects header](https://github.com/lirantal/awesome-opensource-israel#projects-by-main-language).
- `/api/compsdb` - Returns a list of organizations, scraped from [the companies header](https://github.com/lirantal/awesome-opensource-israel#companies), along with all their repos (heavy response, currently not using this).
- `api/company/{company}` - Returns a specific company along with its repositories.
- `api/allcomps` - Returns a list of organizations without their repositories.
