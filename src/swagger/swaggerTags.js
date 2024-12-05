const registeredTags = new Set();

export const registerTag = (name, description) => {
   registeredTags.add(JSON.stringify({ name, description }));
};

export const getRegisteredTags = () => {
   return Array.from(registeredTags).map(tag => JSON.parse(tag));
};
