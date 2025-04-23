import React, { useState } from 'react';
import axios from 'axios';

const Cadastro = () => {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [endereco, setEndereco] = useState('');
  const [isNutricionista, setIsNutricionista] = useState(false);

  // Campos adicionais para o Cliente ou Nutricionista
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  const [preferenciasAlimentares, setPreferenciasAlimentares] = useState('');
  const [doencasPreexistentes, setDoencasPreexistentes] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Preparar o corpo da requisição
      const usuarioPayload = {
        nome,
        email,
        senha: password,
        tipoUsuario: isNutricionista ? 'Nutricionista' : 'Cliente',
        cpf,
        telefone,
        dataNascimento,
        sexo,
        endereco,
        peso: isNutricionista ? null : peso,
        altura: isNutricionista ? null : altura,
        objetivo: isNutricionista ? null : objetivo,
        nivelAtividade: isNutricionista ? null : nivelAtividade,
        preferenciasAlimentares: isNutricionista ? null : preferenciasAlimentares,
        doencasPreexistentes: isNutricionista ? null : doencasPreexistentes,
        especialidade: isNutricionista ? especialidade : null,
        descricao: isNutricionista ? descricao : null
      };

      // Enviar a requisição POST para o backend
      const response = await axios.post('http://localhost:5000/api/usuarios', usuarioPayload);

      console.log('Usuário cadastrado com sucesso:', response.data);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h1>Cadastro</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirmar Senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} required />
        <input type="text" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} required />
        <input type="date" placeholder="Data de Nascimento" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required />
        <select value={sexo} onChange={e => setSexo(e.target.value)} required>
          <option value="">Sexo</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} required />
        
        {/* Campos adicionais */}
        {isNutricionista ? (
          <>
            <input type="text" placeholder="Especialidade" value={especialidade} onChange={e => setEspecialidade(e.target.value)} />
            <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
          </>
        ) : (
          <>
            <input type="text" placeholder="Peso" value={peso} onChange={e => setPeso(e.target.value)} />
            <input type="text" placeholder="Altura" value={altura} onChange={e => setAltura(e.target.value)} />
            <input type="text" placeholder="Objetivo" value={objetivo} onChange={e => setObjetivo(e.target.value)} />
            <input type="text" placeholder="Nível de Atividade" value={nivelAtividade} onChange={e => setNivelAtividade(e.target.value)} />
            <input type="text" placeholder="Preferências Alimentares" value={preferenciasAlimentares} onChange={e => setPreferenciasAlimentares(e.target.value)} />
            <input type="text" placeholder="Doenças Preexistentes" value={doencasPreexistentes} onChange={e => setDoencasPreexistentes(e.target.value)} />
          </>
        )}
        
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Cadastro;
