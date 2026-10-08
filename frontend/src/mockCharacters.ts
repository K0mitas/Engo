export type Character = {
    id: string;
    name: string;
    role: string;
    age: string;
    avatar: string;
  };
  
  export type Folder = {
    id: string;
    name: string;
    characterIds: string[];
  };
  
  export const mockCharacters: Character[] = [
    { id: '1', name: 'Алексей', role: 'Главный герой', age: '28 лет', avatar: 'https://picsum.photos/seed/char1/300/300' },
    { id: '2', name: 'Мария',   role: 'Девушка',       age: '26 лет', avatar: 'https://picsum.photos/seed/char2/300/300' },
    { id: '3', name: 'Виктор',  role: 'Отец',          age: '55 лет', avatar: 'https://picsum.photos/seed/char3/300/300' },
    { id: '4', name: 'Анна',    role: 'Мать',          age: '52 года', avatar: 'https://picsum.photos/seed/char4/300/300' },
    { id: '5', name: 'Дмитрий', role: 'Друг',          age: '30 лет', avatar: 'https://picsum.photos/seed/char5/300/300' },
    { id: '6', name: 'Николай', role: 'Коллега',       age: '35 лет', avatar: 'https://picsum.photos/seed/char6/300/300' },
  ];
  
  export const mockFolders: Folder[] = [
    { id: 'f1', name: 'История одного человека', characterIds: ['1', '2', '3'] },
    { id: 'f2', name: 'Реклама кофейни',         characterIds: ['5'] },
  ];