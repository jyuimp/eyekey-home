import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const config = window.EYEKEY_SUPABASE_CONFIG || {};
const setup = document.querySelector('[data-setup]');
const app = document.querySelector('[data-app]');
const login = document.querySelector('[data-login]');
const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('[data-login-message]');
const dashboardMessage = document.querySelector('[data-dashboard-message]');
const range = document.querySelector('#range');
let supabase;
const LOGIN_TIMEOUT_MS = 15000;

const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[char]);
const formatNumber = (value) => new Intl.NumberFormat('ko-KR').format(value);
const formatDate = (value) => new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

function setMessage(text, type = 'info') {
  dashboardMessage.textContent = text;
  dashboardMessage.dataset.type = type;
  dashboardMessage.setAttribute('role', type === 'error' ? 'alert' : 'status');
  dashboardMessage.hidden = !text;
}

function setLoginMessage(text, type = 'info') {
  loginMessage.textContent = text;
  loginMessage.dataset.type = type;
  loginMessage.setAttribute('role', type === 'error' ? 'alert' : 'status');
  loginMessage.hidden = !text;
}

async function withTimeout(promise, milliseconds) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('로그인 요청 시간이 초과되었습니다. 네트워크 연결을 확인해 주세요.')), milliseconds);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function showApp(email) {
  login.hidden = true;
  app.hidden = false;
  $('#admin-email').textContent = email || '관리자';
  loadDashboard();
}

async function loadDashboard() {
  setMessage('데이터를 불러오는 중입니다.');
  try {
    const since = new Date(Date.now() - Number(range.value) * 86400000).toISOString();
    const { data, error } = await supabase.from('analytics_events')
      .select('event_name,path,session_id,metadata,created_at')
      .gte('created_at', since).order('created_at', { ascending: false }).limit(5000);
    if (error) { setMessage(`데이터를 불러오지 못했습니다: ${error.message}`, 'error'); return; }
    renderDashboard(data || []);
    setMessage('');
  } catch (error) {
    setMessage(`네트워크 오류가 발생했습니다: ${error.message}`, 'error');
  }
}

function renderDashboard(events) {
  const pageViews = events.filter((event) => event.event_name === 'page_view');
  const visitors = new Set(events.map((event) => event.session_id)).size;
  const clicks = events.filter((event) => event.event_name === 'click').length;
  $('#metric-visitors').textContent = formatNumber(visitors);
  $('#metric-views').textContent = formatNumber(pageViews.length);
  $('#metric-clicks').textContent = formatNumber(clicks);
  const paths = pageViews.reduce((counts, event) => { counts[event.path] = (counts[event.path] || 0) + 1; return counts; }, {});
  const ranked = Object.entries(paths).sort((a, b) => b[1] - a[1]);
  const max = ranked[0]?.[1] || 1;
  $('#pages').innerHTML = ranked.length ? ranked.slice(0, 6).map(([path, count]) => `<li><span>${esc(path)}</span><b>${formatNumber(count)}회</b><i aria-hidden="true" style="--size:${Math.round(count / max * 100)}%"></i></li>`).join('') : '<li class="empty">아직 수집된 페이지 조회가 없습니다.</li>';
  $('#event-rows').innerHTML = events.slice(0, 40).map((event) => `<tr><td>${esc(event.event_name)}</td><td>${esc(event.path)}</td><td>${esc(event.metadata?.label || '-')}</td><td>${formatDate(event.created_at)}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">수집된 이벤트가 없습니다.</td></tr>';
}

async function init() {
  if (!config.url || !config.publishableKey) { setup.hidden = false; login.hidden = true; return; }
  supabase = createClient(config.url, config.publishableKey, { auth: { persistSession: true, detectSessionInUrl: true } });
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) showApp(session.user.email);
  } catch (error) {
    setLoginMessage(`인증 서버에 연결할 수 없습니다: ${error.message}`, 'error');
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) showApp(session.user.email);
    else { app.hidden = true; login.hidden = false; }
  });
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); setLoginMessage('로그인 중입니다.');
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email: $('#email').value.trim(), password: $('#password').value }),
        LOGIN_TIMEOUT_MS
      );
      if (error) { setLoginMessage('로그인 정보를 확인해 주세요.', 'error'); return; }
      showApp(data.user.email);
    } catch (error) {
      setLoginMessage(`로그인 요청에 실패했습니다: ${error.message}`, 'error');
    }
  });
  $('#logout').addEventListener('click', async () => {
    try { await supabase.auth.signOut(); } catch (error) { setMessage(`로그아웃에 실패했습니다: ${error.message}`, 'error'); }
  });
  range.addEventListener('change', loadDashboard);
}

const updateNav = () => document.querySelectorAll('.nav a[href^="#"]').forEach((link) => {
  link.setAttribute('aria-current', link.hash === (location.hash || '#overview') ? 'page' : 'false');
});
window.addEventListener('hashchange', updateNav);
updateNav();
init();
