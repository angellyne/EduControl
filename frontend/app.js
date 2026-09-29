const API = 'http://localhost:3000/api';
const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];

async function http(metodo, rota, dados=null){
  const opts = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if(dados) opts.body = JSON.stringify(dados);
  const r = await fetch(API + rota, opts);
  const json = await r.json();
  if(!r.ok || json.erro) throw new Error(json.erro || 'Erro na API');
  return json;
}
const get  = (rota)    => http('GET', rota);
const post = (rota, d) => http('POST', rota, d);
const del  = (rota)    => http('DELETE', rota);

function toast(msg, tipo=''){
  const t = $('#toast');
  if(!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + tipo;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = 'toast', 3000);
}

$$('#tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('#tabs .tab').forEach(b => b.classList.remove('active'));
    $$('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const painel = document.getElementById(btn.dataset.tab);
    if(painel) painel.classList.add('active');
  });
});

let escolas=[], professores=[], disciplinas=[], turmas=[], alunos=[], responsaveis=[];

async function renderTudo(){
  try {
    [escolas, professores, disciplinas, turmas, alunos, responsaveis] = await Promise.all([
      get('/escolas'), get('/professores'), get('/disciplinas'),
      get('/turmas'), get('/alunos'), get('/responsaveis')
    ]);
  } catch(e){
    console.error('Erro ao carregar dados:', e);
    escolas=[]; professores=[]; disciplinas=[]; turmas=[]; alunos=[]; responsaveis=[];
  }
  renderDashboard();
  renderEscolas();
  renderProfessores();
  renderDisciplinas();
  renderTurmas();
  renderAlunos();
  renderResponsaveis();
  preencherSelects();
}

function renderDashboard(){
  const el = id => document.getElementById(id);
  if(el('stat-escolas'))     el('stat-escolas').textContent     = escolas.length;
  if(el('stat-professores')) el('stat-professores').textContent = professores.length;
  if(el('stat-disciplinas')) el('stat-disciplinas').textContent = disciplinas.length;
  if(el('stat-turmas'))      el('stat-turmas').textContent      = turmas.length;
  if(el('stat-alunos'))      el('stat-alunos').textContent      = alunos.length;
  if(el('stat-matriculas'))  el('stat-matriculas').textContent  = 0;
}

function renderEscolas(){
  const tb = $('#tabela-escolas tbody');
  if(!tb) return;
  tb.innerHTML = escolas.length
    ? escolas.map(e => `<tr><td>${e.id_escola}</td><td>${e.nome}</td><td>${e.endereco||'—'}</td><td>${e.cnpj||'—'}</td><td><button class="btn-del" onclick="excluir('escolas', ${e.id_escola})">Excluir</button></td></tr>`).join('')
    : `<tr><td colspan="5" class="empty">Nenhuma escola cadastrada.</td></tr>`;
}

function renderProfessores(){
  const tb = $('#tabela-professores tbody');
  if(!tb) return;
  tb.innerHTML = professores.length
    ? professores.map(p => `<tr><td>${p.id_professor}</td><td>${p.nome}</td><td>${p.cpf}</td><td>${p.email}</td><td>${p.escola||'—'}</td><td><button class="btn-del" onclick="excluir('professores', ${p.id_professor})">Excluir</button></td></tr>`).join('')
    : `<tr><td colspan="6" class="empty">Nenhum professor cadastrado.</td></tr>`;
}

function renderDisciplinas(){
  const tb = $('#tabela-disciplinas tbody');
  if(!tb) return;
  tb.innerHTML = disciplinas.length
    ? disciplinas.map(d => `<tr><td>${d.id_disciplina}</td><td>${d.nome}</td><td>${d.carga_horaria?d.carga_horaria+'h':'—'}</td><td><button class="btn-del" onclick="excluir('disciplinas', ${d.id_disciplina})">Excluir</button></td></tr>`).join('')
    : `<tr><td colspan="4" class="empty">Nenhuma disciplina cadastrada.</td></tr>`;
}

function renderTurmas(){
  const tb = $('#tabela-turmas tbody');
  if(!tb) return;
  tb.innerHTML = turmas.length
    ? turmas.map(t => `<tr><td>${t.id_turma}</td><td>${t.serie}</td><td>${t.ano_letivo}</td><td>${t.numero_chamada||'—'}</td><td>${t.capacidade||'—'}</td><td>${t.quantidade_aluno||0}</td><td>${t.escola||'—'}</td><td><button class="btn-del" onclick="excluir('turmas', ${t.id_turma})">Excluir</button></td></tr>`).join('')
    : `<tr><td colspan="8" class="empty">Nenhuma turma cadastrada.</td></tr>`;
}

function renderAlunos(){
  const tb = $('#tabela-alunos tbody');
  if(!tb) return;
  tb.innerHTML = alunos.length
    ? alunos.map(a => {
        const resps = responsaveis.filter(r => r.id_aluno === a.id_aluno).map(r => `${r.nome} (${r.parentesco})`).join(', ') || '—';
        return `<tr><td>${a.id_aluno}</td><td>${a.nome}</td><td>${a.cpf}</td><td>${a.data_nascimento||'—'}</td><td>${a.idade||'—'}</td><td>${a.turma||'—'}</td><td>${resps}</td><td><button class="btn-del" onclick="excluir('alunos', ${a.id_aluno})">Excluir</button></td></tr>`;
      }).join('')
    : `<tr><td colspan="8" class="empty">Nenhum aluno cadastrado.</td></tr>`;
}

function renderResponsaveis(){
  const tb = $('#tabela-responsaveis tbody');
  if(!tb) return;
  tb.innerHTML = responsaveis.length
    ? responsaveis.map(r => `<tr><td>${r.id_responsavel}</td><td>${r.nome}</td><td>${r.cpf}</td><td>${r.telefone||'—'}</td><td><button class="btn-del" onclick="excluir('responsaveis', ${r.id_responsavel})">Excluir</button></td></tr>`).join('')
    : `<tr><td colspan="5" class="empty">Nenhum responsável cadastrado.</td></tr>`;
}

function preencherSelects(){
  const opt = (arr, fn) => arr.map(fn).join('');
  const set = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };

  set('select-escola-prof', '<option value="">Selecione...</option>' + opt(escolas, e => `<option value="${e.id_escola}">${e.nome}</option>`));
  set('select-escola-turma', '<option value="">Selecione...</option>' + opt(escolas, e => `<option value="${e.id_escola}">${e.nome}</option>`));
  set('select-turma-aluno', '<option value="">Sem turma</option>' + opt(turmas, t => `<option value="${t.id_turma}">${t.serie} (${t.ano_letivo})</option>`));
  set('select-aluno-resp', '<option value="">Selecione...</option>' + opt(alunos, a => `<option value="${a.id_aluno}">${a.nome}</option>`));
  set('select-turma-vinculo', '<option value="">Selecione...</option>' + opt(turmas, t => `<option value="${t.id_turma}">${t.serie} (${t.ano_letivo})</option>`));
  set('select-disciplina-vinculo', '<option value="">Selecione...</option>' + opt(disciplinas, d => `<option value="${d.id_disciplina}">${d.nome}</option>`));
  set('select-professor-vinculo', '<option value="">Selecione...</option>' + opt(professores, p => `<option value="${p.id_professor}">${p.nome}</option>`));
  set('select-aluno-matricula', '<option value="">Selecione...</option>' + opt(alunos, a => `<option value="${a.id_aluno}">${a.nome}</option>`));
  set('select-aluno-freq', '<option value="">Selecione...</option>' + opt(alunos, a => `<option value="${a.id_aluno}">${a.nome}</option>`));
}

function bind(idForm, rota, montarDados, msgOk){
  const f = document.getElementById(idForm);
  if(!f) return;
  f.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await post(rota, montarDados(e.target));
      e.target.reset();
      await renderTudo();
      toast(msgOk, 'success');
    } catch(err){ toast(err.message, 'error'); }
  });
}

bind('form-escola', '/escolas', f => ({ nome: f.nome.value.trim(), endereco: f.endereco.value.trim(), cnpj: f.cnpj.value.trim() }), 'Escola cadastrada!');
bind('form-professor', '/professores', f => ({ nome: f.nome.value.trim(), cpf: f.cpf.value.trim(), email: f.email.value.trim(), id_escola: f.id_escola.value }), 'Professor cadastrado!');
bind('form-disciplina', '/disciplinas', f => ({ nome: f.nome.value.trim(), carga: f.carga.value }), 'Disciplina cadastrada!');
bind('form-turma', '/turmas', f => ({ serie: f.serie.value.trim(), ano: f.ano.value, numero_chamada: f.chamada.value, capacidade: f.capacidade.value, id_escola: f.id_escola.value }), 'Turma cadastrada!');
bind('form-aluno', '/alunos', f => ({ nome: f.nome.value.trim(), cpf: f.cpf.value.trim(), nascimento: f.nascimento.value, id_turma: f.id_turma.value || null }), 'Aluno cadastrado!');
bind('form-responsavel', '/responsaveis', f => ({ nome: f.nome.value.trim(), cpf: f.cpf.value.trim(), telefone: f.telefone.value.trim(), id_aluno: f.id_aluno.value, parentesco: f.parentesco.value }), 'Responsável cadastrado!');

window.excluir = async function(recurso, id){
  if(!confirm('Deseja realmente excluir?')) return;
  try {
    await del(`/${recurso}/${id}`);
    await renderTudo();
    toast('Registro excluído.', 'success');
  } catch(err){ toast(err.message, 'error'); }
};

renderTudo();