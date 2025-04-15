import firestore from '@react-native-firebase/firestore';

// Adicionar um novo documento
const adicionarDocumento = async () => {
  await firestore()
    .collection('usuarios') // nome da sua coleção
    .add({
      nome: 'João',
      idade: 25,
      email: 'joao@email.com',
    });
};
