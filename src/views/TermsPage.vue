<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <main class="terms-page">
        <section class="terms-panel" aria-label="Termos de uso Agua+">
          <router-link class="brand" to="/cadastro" aria-label="Voltar para cadastro">
            <span><ion-icon :icon="waterOutline" /></span>
            Agua<b>+</b>
          </router-link>

          <header class="terms-hero">
            <span>Termos e privacidade</span>
            <h1>Termos de uso do Agua+</h1>
            <p>Ultima atualizacao: 6 de agosto de 2026.</p>
          </header>

          <article class="terms-card">
            <section>
              <h2>1. Sobre o Agua+</h2>
              <p>
                O Agua+ e um aplicativo em desenvolvimento para acompanhar consumo de agua, organizar leituras, exibir
                alertas e apoiar metas de economia em instituicoes e unidades monitoradas.
              </p>
            </section>

            <section>
              <h2>2. Uso do aplicativo</h2>
              <p>
                Ao criar uma conta, voce concorda em informar dados corretos, manter o acesso protegido e usar o sistema
                apenas para fins de acompanhamento, estudo, demonstracao ou gestao interna autorizada.
              </p>
            </section>

            <section>
              <h2>3. Dados coletados</h2>
              <p>
                O app pode armazenar nome, e-mail, telefone, instituicao, unidade, cargo, preferencias, dispositivos
                cadastrados, alertas e leituras de consumo. Enquanto o projeto estiver em simulacao, os valores exibidos
                podem ser dados ficticios usados para testes.
              </p>
            </section>

            <section>
              <h2>4. Conta Google e autenticacao</h2>
              <p>
                Caso voce entre com Google, o Agua+ pode utilizar dados basicos da conta, como nome, e-mail e foto de
                perfil, para preencher seu cadastro e identificar sua sessao.
              </p>
            </section>

            <section>
              <h2>5. Leituras e dispositivos</h2>
              <p>
                A estrutura do app esta preparada para receber dados de sensores e microcontroladores no futuro. Ate a
                conexao com hardware real, os dados podem continuar simulados e nao devem ser usados como medicao oficial.
              </p>
            </section>

            <section>
              <h2>6. Responsabilidades do usuario</h2>
              <p>
                O usuario deve revisar as informacoes cadastradas, evitar compartilhar credenciais e nao utilizar o app
                como unica fonte para decisoes criticas de manutencao, cobranca ou seguranca operacional.
              </p>
            </section>

            <section>
              <h2>7. Privacidade</h2>
              <p>
                Os dados sao usados para funcionamento do proprio Agua+, personalizacao do perfil, exibicao de historico,
                alertas e relatorios. O projeto deve manter regras de acesso para que cada usuario veja apenas os dados
                associados a sua propria conta.
              </p>
            </section>

            <section>
              <h2>8. Exclusao de conta</h2>
              <p>
                O usuario pode solicitar a exclusao da conta pela aba de perfil. Quando disponivel, essa acao remove a
                conta de autenticacao e limpa os dados locais vinculados ao acesso atual.
              </p>
            </section>

            <section>
              <h2>9. Alteracoes nos termos</h2>
              <p>
                Estes termos podem ser atualizados conforme o Agua+ evoluir, principalmente quando forem adicionadas
                integracoes reais com sensores, APIs, banco de dados e notificacoes.
              </p>
            </section>
          </article>

          <div class="terms-actions">
            <router-link class="back-button" to="/cadastro">
              <ion-icon :icon="arrowBackOutline" />
              Voltar ao cadastro
            </router-link>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowBackOutline, waterOutline } from 'ionicons/icons';
</script>

<style scoped>
.terms-page {
  --terms-petroleo: #0d4b5e;
  --terms-agua: #1ca7a0;
  --terms-bg: #ffffff;
  --terms-texto: #16343d;
  --terms-suave: #718087;
  --terms-borda: #d8e1e3;
  background:
    radial-gradient(circle at 14% 8%, rgba(28, 167, 160, 0.12), transparent 30%),
    linear-gradient(120deg, #ffffff, #f7fbfb 48%, #eaf4f4);
  color: var(--terms-texto);
  font-family: Poppins, sans-serif;
  min-height: 100%;
  padding: 38px 22px;
}

.terms-panel {
  margin: 0 auto;
  max-width: 920px;
}

.brand {
  align-items: center;
  color: var(--terms-petroleo);
  display: inline-flex;
  font-size: 25px;
  font-weight: 700;
  gap: 9px;
  text-decoration: none;
}

.brand span {
  background: var(--terms-petroleo);
  border-radius: 14px;
  color: var(--terms-bg);
  display: grid;
  height: 40px;
  place-items: center;
  width: 40px;
}

.brand b {
  color: var(--terms-agua);
}

.terms-hero {
  margin: 34px 0 22px;
}

.terms-hero span {
  background: rgba(28, 167, 160, 0.1);
  border: 1px solid rgba(28, 167, 160, 0.18);
  border-radius: 999px;
  color: #137d78;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 14px;
  padding: 8px 12px;
}

.terms-hero h1 {
  color: var(--terms-petroleo);
  font-size: clamp(30px, 5vw, 48px);
  letter-spacing: 0;
  line-height: 1.05;
  margin: 0 0 10px;
}

.terms-hero p {
  color: var(--terms-suave);
  font-size: 14px;
  margin: 0;
}

.terms-card {
  background: var(--terms-bg);
  border: 1px solid var(--terms-borda);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(13, 75, 94, 0.1);
  display: grid;
  gap: 20px;
  padding: 26px;
}

.terms-card section {
  border-bottom: 1px solid #edf2f3;
  padding-bottom: 18px;
}

.terms-card section:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.terms-card h2 {
  color: var(--terms-petroleo);
  font-size: 17px;
  margin: 0 0 8px;
}

.terms-card p {
  color: var(--terms-suave);
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.terms-actions {
  display: flex;
  margin-top: 18px;
}

.back-button {
  align-items: center;
  background: var(--terms-petroleo);
  border-radius: 14px;
  color: #ffffff;
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  gap: 8px;
  min-height: 46px;
  padding: 0 16px;
  text-decoration: none;
}

@media (max-width: 640px) {
  .terms-page {
    padding: 28px 18px;
  }

  .terms-card {
    border-radius: 16px;
    padding: 20px;
  }

  .back-button {
    justify-content: center;
    width: 100%;
  }
}
</style>
