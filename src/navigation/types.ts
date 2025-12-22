export type DrawerParamList = {
  Home: undefined;
  Statistical: undefined;
  Setting: undefined;
  DownloadExample: undefined;
};

export type AppStackParamList = {
  Drawer: undefined;
  Study: { deckId: string; title: string };
  UserProfile: undefined;
  ViewAllCards: { collectionId: string; collectionTitle: string };
  ChangePassword: undefined;
  OCRCardCreator: { collectionId: string; collectionTitle: string };
  VisionOCRCardCreator: { collectionId: string; collectionTitle: string };
};
