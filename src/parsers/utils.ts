const getLanguageExtensions = (languages: string[]) => {
  return languages
    .map(lang => require(`linguist-languages/data/${lang}`))
    .flatMap(data => data.extensions);
};

export { getLanguageExtensions };
