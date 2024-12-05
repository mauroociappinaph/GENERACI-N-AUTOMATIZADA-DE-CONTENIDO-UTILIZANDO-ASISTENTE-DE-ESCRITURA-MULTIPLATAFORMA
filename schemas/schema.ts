  export const User = {
    className: "_User",
    fields: {
      emailVerified: { type: "Boolean", defaultValue: false},
      phone: { type: "String", required: true},
      user_type: { type: "String" , required: true},
      authData : { type: "Object" },
      username: { type: "String" , required: true},
      user_birthDate: { type: "Date" },
      fullname: { type: "String", required: true },
      password: { type: "String" },
      email: { type: "String", required: true },
      accounts: { type: "Array" },
      ethAddress : {type: 'String'},
      nemotecnic:{type: 'String'},
      privateKey : {type: 'String'},
      validatePing: { type: "Boolean" },
    },
    /* indexes: {
      tagsIndex: { tags: 1 },
      // The special prefix _p_ is used to create indexes on pointer fields
      cityPointerIndex: { _p_city: 1 },
      tagAndCityIndex: { _p_city: 1, tags: 1 },
    }, */
    classLevelPermissions: {
      find: { requiresAuthentication: true },
      //*count: { "role:Admin": true },
      count: { "*": true },
      get: { "*": true },
      addField: { 'role:admin': true },
      update:   { 'role:admin': true },
      create:   { '*': true },
      delete:   { "role:admin": true },
      protectedFields: {
        // These fields will be protected from all other users. AuthData and password are already protected by default
        "*": ["emailVerified", "authData", "password", "privateKey", "ethAddress", "nemotecnic", "privateKey", "validatePing"],
      },
    },    
  };

  