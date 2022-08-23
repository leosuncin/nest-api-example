# Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.5.0](https://github.com/leosuncin/nest-api-example/compare/v1.4.1...v1.5.0) (2022-08-23)

### Features

- upgrade to Nest.js v9 & TypeORM v0.3.x ([18d1174](https://github.com/leosuncin/nest-api-example/commit/18d11749cf192f1afca1438eb62e0abd78233751))

## [1.4.1](https://github.com/leosuncin/nest-api-example/compare/v1.4.0...v1.4.1) (2022-08-14)

# [1.4.0](https://github.com/leosuncin/nest-api-example/compare/v1.3.1...v1.4.0) (2022-08-14)

### Features

- **auth:** validate that the password must be different than username ([701b634](https://github.com/leosuncin/nest-api-example/commit/701b634fb04a6133382f91058379342bb3da8712))

## [1.3.1](https://github.com/leosuncin/nest-api-example/compare/v1.3.0...v1.3.1) (2022-05-26)

### Performance Improvements

- reduce duplicate code in tests ([9525bdc](https://github.com/leosuncin/nest-api-example/commit/9525bdcb1c852214bba22a85f29bfe04292f7ba9))

## [1.3.1](https://github.com/leosuncin/nest-api-example/compare/v1.3.0...v1.3.1) (2022-05-26)

### Performance Improvements

- reduce duplicate code in tests ([9525bdc](https://github.com/leosuncin/nest-api-example/commit/9525bdcb1c852214bba22a85f29bfe04292f7ba9))

# [1.3.0](https://github.com/leosuncin/nest-api-example/compare/v1.2.0...v1.3.0) (2022-05-19)

### Features

- **auth:** validate that the password is not exposed in haveibeenpwned.com ([381461f](https://github.com/leosuncin/nest-api-example/commit/381461f59a1fab6bc4bdb9cc13014d97cde15fbf))

# [1.2.0](https://github.com/leosuncin/nest-api-example/compare/v1.1.0...v1.2.0) (2022-05-17)

### Features

- **auth:** normalize email ([ea6f903](https://github.com/leosuncin/nest-api-example/commit/ea6f903ad9c26dbea813e0a4cfe5d0ebcf0782b9))

# [1.1.0](https://github.com/leosuncin/nest-api-example/compare/v1.0.0...v1.1.0) (2022-05-16)

### Bug Fixes

- **blog:** amend pagination of comments ([d2b9b11](https://github.com/leosuncin/nest-api-example/commit/d2b9b110b01fc9e226a6ac2311416c5fd3961c4e))

### Features

- **blog:** add blog module ([f4d469e](https://github.com/leosuncin/nest-api-example/commit/f4d469e174f9dd54de3c3b9106389248084a4399))
- **blog:** create a new article ([b5b8b45](https://github.com/leosuncin/nest-api-example/commit/b5b8b456e0520204082efd073065c751b0312e5f))
- **blog:** create a new article ([ea56b7f](https://github.com/leosuncin/nest-api-example/commit/ea56b7f56fcb741f403e498e18e02093a0a7108f))
- **blog:** get one article by id or slug ([28b30f5](https://github.com/leosuncin/nest-api-example/commit/28b30f55dd51f4a2b1f954e654a0e87ee0eee501))
- **blog:** list and paginate articles ([4482786](https://github.com/leosuncin/nest-api-example/commit/44827861b3c0ea870de5de666bd9560bf7e07ad9))
- **blog:** list and paginate comments ([12fcd8c](https://github.com/leosuncin/nest-api-example/commit/12fcd8c7c035f13e3e0d97652ba2df441ec845ad))
- **blog:** remove one article ([f5a3d64](https://github.com/leosuncin/nest-api-example/commit/f5a3d647276ed826c0fabdaad9bff816d1865cbe))
- **blog:** remove one comment ([7a81ee9](https://github.com/leosuncin/nest-api-example/commit/7a81ee9d8bfe471db59ca6e08b9937732ab72374))
- **blog:** update one article ([9ee4ef2](https://github.com/leosuncin/nest-api-example/commit/9ee4ef26108421c162efe2d6a3a1a6ded7b4d601))

# 1.0.0 (2022-04-30)

### Bug Fixes

- **auth:** avoid to override the password ([9fd6bf0](https://github.com/leosuncin/nest-api-example/commit/9fd6bf0eafcdc888cdfdf07557fbf6c6b35c989e))
- **auth:** exclude password from response ([51fc34e](https://github.com/leosuncin/nest-api-example/commit/51fc34ec63040f2d195acbe62bd2cf995634c3f8))
- wrap variable in dowuble quotes ([c12714c](https://github.com/leosuncin/nest-api-example/commit/c12714ca1a0aaf8a90024ddb9477d8659b6d2df3))

### Features

- **auth:** add auth module ([4dfd453](https://github.com/leosuncin/nest-api-example/commit/4dfd4539fcf9409bf239a5120f48c3c8ea88dc79))
- **auth:** add interceptor to add JWT in the response ([c9e7b0c](https://github.com/leosuncin/nest-api-example/commit/c9e7b0c66264bb2cf810bd22b736e6c979588e14))
- **auth:** add login DTO with validation ([ac5a65b](https://github.com/leosuncin/nest-api-example/commit/ac5a65b356ccae1c5757e848a5aed2af8c3fac44))
- **auth:** add register DTO with validation ([fe4b7f7](https://github.com/leosuncin/nest-api-example/commit/fe4b7f74c53b2a64cc4c8164a02530ece22dc6da))
- **auth:** add user entity ([ddead6d](https://github.com/leosuncin/nest-api-example/commit/ddead6d4e46725f19c1e52b088c8a076e157cfdd))
- **auth:** get current user from JWT ([9e06025](https://github.com/leosuncin/nest-api-example/commit/9e06025d5fa13706a08d114428a2aae451837b43))
- **auth:** login with an existing user ([dd8f6b1](https://github.com/leosuncin/nest-api-example/commit/dd8f6b1724e79de073dc863887d1b8bafcae85c4))
- **auth:** prevent to register a duplicate user ([1225fe5](https://github.com/leosuncin/nest-api-example/commit/1225fe5391b7ed4938ca7aa68a4019ffb01ddf14))
- **auth:** register a new user ([dcd98da](https://github.com/leosuncin/nest-api-example/commit/dcd98daad4118b965354f7620524f04bd3edb4bb))
- **auth:** update current user data ([820d2e3](https://github.com/leosuncin/nest-api-example/commit/820d2e35748c375ce9c4fc358d8fa8e039928de7))
- **auth:** validate the update of the user ([5678139](https://github.com/leosuncin/nest-api-example/commit/5678139b187f138f96b850a05d41dcb3f11450df))
- **auth:** validate user credentials ([fe0d673](https://github.com/leosuncin/nest-api-example/commit/fe0d67330c83eb7c84db9a86b7d26280d8f8070b))
- setup TypeORM with PosgreSQL ([13aa047](https://github.com/leosuncin/nest-api-example/commit/13aa047bb098571040709dccacf15e590528696b))
- use validation pipe globally ([269dd59](https://github.com/leosuncin/nest-api-example/commit/269dd59811a10914bdbb2de27c96f68e0e3bec75))
