document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8080/api';
    let USUARIO_LOGADO = null;

    const RESERVAS_LOCAL_KEY = 'minhasReservas';
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('.nav-link');
    const navAlimentos = document.getElementById('nav-alimentos');
    const navLogin = document.getElementById('nav-login');
    const navCadastro = document.getElementById('nav-cadastro');
    const navLogout = document.getElementById('nav-logout');
    const navDoarAlimento = document.getElementById('nav-doar-alimento');
    const navMinhasDoacoes = document.getElementById('nav-minhas-doacoes');
    const navMinhasReservas = document.getElementById('nav-minhas-reservas');
    const publicLinks = document.querySelectorAll('.public-only');
    const donorLinks = document.querySelectorAll('.donor-only');
    const beneficiaryLinks = document.querySelectorAll('.beneficiary-only');
    const infoUsuario = document.getElementById('info-usuario');
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');
    const formDoarAlimento = document.getElementById('form-doar-alimento');
    const listaAlimentos = document.getElementById('lista-alimentos');
    const listaMinhasDoacoes = document.getElementById('lista-minhas-doacoes');
    const listaMinhasReservas = document.getElementById('lista-minhas-reservas');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorToast = document.getElementById('error-toast');
    
    function showView(viewId) {
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.getElementById(viewId.replace('view-', 'nav-'));
        if (activeLink) activeLink.classList.add('active');
    }
    
    function showLoading(isLoading) {
        loadingOverlay.classList.toggle('active', isLoading);
    }
    
    function showError(message) {
        errorToast.textContent = message;
        errorToast.classList.add('show');
        setTimeout(() => errorToast.classList.remove('show'), 3000);
    }

    function atualizarUI() {
        if (USUARIO_LOGADO) {
            infoUsuario.textContent = `Olá, ${USUARIO_LOGADO.nome}! (Perfil: ${USUARIO_LOGADO.tipoPerfil})`;
            navLogout.style.display = 'inline-block';
            publicLinks.forEach(link => link.style.display = 'none');
            
            if (USUARIO_LOGADO.tipoPerfil === 'DOADOR') {
                donorLinks.forEach(link => link.style.display = 'inline-block');
                beneficiaryLinks.forEach(link => link.style.display = 'none');
            } else if (USUARIO_LOGADO.tipoPerfil === 'BENEFICIARIO') {
                donorLinks.forEach(link => link.style.display = 'none');
                beneficiaryLinks.forEach(link => link.style.display = 'inline-block');
            } else {
                donorLinks.forEach(link => link.style.display = 'none');
                beneficiaryLinks.forEach(link => link.style.display = 'none');
            }
        } else {
            infoUsuario.textContent = '';
            navLogout.style.display = 'none';
            publicLinks.forEach(link => link.style.display = 'inline-block');
            donorLinks.forEach(link => link.style.display = 'none');
            beneficiaryLinks.forEach(link => link.style.display = 'none');
        }
    }

    async function carregarAlimentos() {
        showLoading(true);
        try {
            const response = await fetch(`${API_URL}/alimentos/disponiveis`);
            if (!response.ok) throw new Error('Falha ao carregar alimentos.');
            const alimentos = await response.json();
            
            listaAlimentos.innerHTML = '';
            if (alimentos.length === 0) {
                listaAlimentos.innerHTML = '<p>Nenhum alimento disponível no momento.</p>';
            }
            alimentos.forEach(alimento => {
                const card = document.createElement('div');
                card.className = 'alimento-card';
                card.innerHTML = `
                    <div class="card-content">
                        <h3>${alimento.nome}</h3>
                        <p>${alimento.descricao || ''}</p>
                        <p><strong>Quantidade:</strong> ${alimento.quantidade} ${alimento.unidadeMedida}</p>
                        <p><strong>Validade:</strong> ${new Date(alimento.dataValidade).toLocaleDateString()}</p>
                        <p><strong>Doador:</strong> ${alimento.doador.nome}</p>
                    </div>
                    <div class="card-footer">
                        ${(USUARIO_LOGADO && USUARIO_LOGADO.tipoPerfil === 'BENEFICIARIO')
                            ? `<button class="btn btn-primary" data-alimento-id="${alimento.id}">Reservar</button>`
                            : `<p>Logue como beneficiário para reservar.</p>`
                        }
                    </div>
                `;
                listaAlimentos.appendChild(card);
            });
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
            showView('view-alimentos');
        }
    }

    async function fazerLogin(email, senha) {
        showLoading(true);
        try {
            const response = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            if (!response.ok) throw new Error('E-mail ou senha inválidos.');
            USUARIO_LOGADO = await response.json();
            localStorage.setItem('usuario', JSON.stringify(USUARIO_LOGADO));
            atualizarUI();
            carregarAlimentos();
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }

    async function cadastrarUsuario(dadosFormulario) {
        showLoading(true);
        const usuario = {
            nome: dadosFormulario.get('nome'),
            email: dadosFormulario.get('email'),
            senha: dadosFormulario.get('senha'),
            telefone: dadosFormulario.get('telefone'),
            tipoPerfil: dadosFormulario.get('tipoPerfil'),
            endereco: {
                cep: dadosFormulario.get('cep'),
                rua: dadosFormulario.get('rua'),
                numero: dadosFormulario.get('numero'),
                complemento: dadosFormulario.get('complemento'),
                bairro: dadosFormulario.get('bairro'),
                cidade: dadosFormulario.get('cidade'),
                estado: dadosFormulario.get('estado')
            }
        };

        try {
            const response = await fetch(`${API_URL}/usuarios/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });
            if (!response.ok) throw new Error('Falha no cadastro. Verifique os dados.');
            alert('Cadastro realizado com sucesso! Faça o login.');
            showView('view-login');
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }
    
    async function fazerReserva(idAlimento) {
        if (!USUARIO_LOGADO) { showError('Você precisa estar logado.'); return; }
        showLoading(true);
        try {
            const response = await fetch(`${API_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idAlimento: Number(idAlimento), idBeneficiario: USUARIO_LOGADO.id })
            });
            if (!response.ok) throw new Error(await response.text() || 'Alimento não está mais disponível.');
            
            const novaReserva = await response.json();
            salvarReservaLocal(novaReserva);
            
            alert('Reserva realizada com sucesso!');
            carregarAlimentos();
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }

    async function cadastrarAlimento(dadosFormulario) {
        if (!USUARIO_LOGADO) { showError('Sessão expirada. Faça login.'); return; }
        showLoading(true);
        const alimento = {
            nome: dadosFormulario.get('nome'),
            descricao: dadosFormulario.get('descricao'),
            quantidade: parseFloat(dadosFormulario.get('quantidade')),
            unidadeMedida: dadosFormulario.get('unidadeMedida'),
            dataValidade: dadosFormulario.get('dataValidade'),
        };
        try {
            const response = await fetch(`${API_URL}/alimentos?idDoador=${USUARIO_LOGADO.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alimento)
            });
            if (!response.ok) throw new Error('Erro ao cadastrar alimento.');
            alert('Alimento cadastrado com sucesso!');
            formDoarAlimento.reset();
            carregarMinhasDoacoes();
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }

    async function carregarMinhasDoacoes() {
        if (!USUARIO_LOGADO) return;
        showLoading(true);
        showView('view-minhas-doacoes');
        try {
            const response = await fetch(`${API_URL}/alimentos/doador/${USUARIO_LOGADO.id}`);
            if (!response.ok) throw new Error('Falha ao carregar suas doações.');
            const alimentos = await response.json();
            
            listaMinhasDoacoes.innerHTML = '';
            if (alimentos.length === 0) {
                listaMinhasDoacoes.innerHTML = '<p>Você ainda não cadastrou nenhum alimento.</p>';
                return;
            }
            alimentos.forEach(alimento => {
                const card = document.createElement('div');
                card.className = 'alimento-card';
                card.innerHTML = `
                    <div class="card-content">
                        <span class="status-tag status-${alimento.status}">${alimento.status}</span>
                        <h3>${alimento.nome}</h3>
                        <p><strong>Quantidade:</strong> ${alimento.quantidade} ${alimento.unidadeMedida}</p>
                        <p><strong>Validade:</strong> ${new Date(alimento.dataValidade).toLocaleDateString()}</p>
                        <p><strong>Postado em:</strong> ${new Date(alimento.dataPostagem).toLocaleString()}</p>
                    </div>
                `;
                listaMinhasDoacoes.appendChild(card);
            });
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }

    function carregarMinhasReservas() {
        if (!USUARIO_LOGADO) return;
        showView('view-minhas-reservas');
        
        const reservas = lerReservasLocal();
        listaMinhasReservas.innerHTML = '';
        
        if (reservas.length === 0) {
            listaMinhasReservas.innerHTML = '<p>Você ainda não fez nenhuma reserva neste navegador.</p>';
            return;
        }

        reservas.forEach(reserva => {
            const card = document.createElement('div');
            card.className = 'reserva-card';
            card.innerHTML = `
                <div class="card-content">
                    <span class="status-tag status-${reserva.status}">${reserva.status}</span>
                    <h3>Reserva #${reserva.id}</h3>
                    <p><strong>Alimento ID:</strong> ${reserva.idAlimento}</p>
                    <p><strong>Reservado em:</strong> ${new Date(reserva.dataReserva).toLocaleString()}</p>
                    ${reserva.dataRetiradaEfetiva 
                        ? `<p><strong>Coletado em:</strong> ${new Date(reserva.dataRetiradaEfetiva).toLocaleString()}</p>` 
                        : ''
                    }
                </div>
                <div class="card-footer">
                    ${(reserva.status === 'PENDENTE')
                        ? `<button class="btn btn-primary btn-small" data-reserva-id="${reserva.id}" data-action="confirmar">Confirmar Coleta</button>
                           <button class="btn btn-danger btn-small" data-reserva-id="${reserva.id}" data-action="cancelar">Cancelar</button>`
                        : `<p>Reserva ${reserva.status.toLowerCase()}.</p>`
                    }
                </div>
            `;
            listaMinhasReservas.appendChild(card);
        });
    }
    
    async function gerenciarReserva(idReserva, acao) {
        if (!confirm(`Tem certeza que deseja ${acao} esta reserva?`)) return;
        showLoading(true);
        const endpoint = (acao === 'confirmar') ? 'confirmar' : 'cancelar';

        try {
            const response = await fetch(`${API_URL}/reservas/${idReserva}/${endpoint}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`Falha ao ${acao} a reserva.`);
            
            const reservaAtualizada = await response.json();
            const reservaAntiga = lerReservasLocal().find(r => r.id === reservaAtualizada.id);
            if(reservaAntiga) {
                reservaAtualizada.idAlimento = reservaAntiga.idAlimento; 
            }
            
            atualizarReservaLocal(reservaAtualizada);
            
            alert(`Reserva ${acao}da com sucesso!`);
            carregarMinhasReservas();
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }

    function fazerLogout() {
        if (USUARIO_LOGADO) {
            const userKey = `${RESERVAS_LOCAL_KEY}_${USUARIO_LOGADO.id}`;
            localStorage.removeItem(userKey)
        }
        
        USUARIO_LOGADO = null;
        localStorage.removeItem('usuario');
        
        atualizarUI();
        carregarAlimentos();
    }
        
    function lerReservasLocal() {
        if (!USUARIO_LOGADO) return [];
        const key = `${RESERVAS_LOCAL_KEY}_${USUARIO_LOGADO.id}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function salvarReservaLocal(novaReserva) {
        if (!USUARIO_LOGADO) return;
        const key = `${RESERVAS_LOCAL_KEY}_${USUARIO_LOGADO.id}`;
        const reservas = lerReservasLocal();

        reservas.push(novaReserva);
        localStorage.setItem(key, JSON.stringify(reservas));
    }
    
    async function fazerReserva(idAlimento) {
        if (!USUARIO_LOGADO) { showError('Você precisa estar logado.'); return; }
        showLoading(true);
        try {
            const response = await fetch(`${API_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idAlimento: Number(idAlimento), idBeneficiario: USUARIO_LOGADO.id })
            });
            if (!response.ok) throw new Error(await response.text() || 'Alimento não está mais disponível.');
            
            const novaReserva = await response.json();
            
            novaReserva.idAlimento = Number(idAlimento); 
            
            salvarReservaLocal(novaReserva);
            
            alert('Reserva realizada com sucesso!');
            carregarAlimentos();
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    }
    
    function atualizarReservaLocal(reservaAtualizada) {
        if (!USUARIO_LOGADO) return;
        const key = `${RESERVAS_LOCAL_KEY}_${USUARIO_LOGADO.id}`;
        let reservas = lerReservasLocal();
        reservas = reservas.map(res => 
            res.id === reservaAtualizada.id ? reservaAtualizada : res
        );
        localStorage.setItem(key, JSON.stringify(reservas));
    }

    navAlimentos.addEventListener('click', (e) => { e.preventDefault(); carregarAlimentos(); });
    navLogin.addEventListener('click', (e) => { e.preventDefault(); showView('view-login'); });
    navCadastro.addEventListener('click', (e) => { e.preventDefault(); showView('view-cadastro'); });
    navLogout.addEventListener('click', (e) => { e.preventDefault(); fazerLogout(); });
    navDoarAlimento.addEventListener('click', (e) => { e.preventDefault(); showView('view-doar-alimento'); });
    navMinhasDoacoes.addEventListener('click', (e) => { e.preventDefault(); carregarMinhasDoacoes(); });
    navMinhasReservas.addEventListener('click', (e) => { e.preventDefault(); carregarMinhasReservas(); });

    // Formulários
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        fazerLogin(e.target.elements['email-login'].value, e.target.elements['senha-login'].value);
    });
    formCadastro.addEventListener('submit', (e) => {
        e.preventDefault();
        cadastrarUsuario(new FormData(e.target));
    });
    formDoarAlimento.addEventListener('submit', (e) => {
        e.preventDefault();
        cadastrarAlimento(new FormData(e.target));
    });

    listaAlimentos.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.alimentoId) {
            e.preventDefault();
            fazerReserva(e.target.dataset.alimentoId);
        }
    });
    listaMinhasReservas.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.reservaId) {
            e.preventDefault();
            gerenciarReserva(e.target.dataset.reservaId, e.target.dataset.action);
        }
    });

    function init() {
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
            USUARIO_LOGADO = JSON.parse(usuarioSalvo);
        }
        atualizarUI();
        carregarAlimentos();
    }

    init();
});