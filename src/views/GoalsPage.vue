<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Metas" period-label="Mes atual">
        <section class="goals-hero">
          <div>
            <span>Plano de economia</span>
            <h2>Metas claras para reduzir consumo sem perder controle.</h2>
            <p>{{ heroMessage }}</p>
          </div>
          <strong>{{ overallProgress }}%</strong>
        </section>

        <section v-if="userGoals.length" class="goals-grid">
          <article v-for="goal in userGoals" :key="goal.id" class="goal-card">
            <div class="goal-head">
              <div>
                <h2>{{ goal.title }}</h2>
                <p>{{ goal.description }}</p>
              </div>
              <div class="goal-actions">
                <span>{{ goal.status }}</span>
                <button type="button" class="delete-goal" @click="deleteGoal(goal.id)">Excluir</button>
              </div>
            </div>

            <div class="progress-line"><i :style="{ width: goal.progress + '%' }" /></div>

            <div class="goal-foot">
              <strong>{{ goal.progress }}%</strong>
              <small>{{ goal.target }}</small>
            </div>
          </article>
        </section>

        <article v-else class="empty-goals">
          <span>Sem metas cadastradas</span>
          <h2>Crie sua primeira meta para comecar o acompanhamento.</h2>
          <p>Quando voce salvar uma meta, ela aparece aqui e tambem no card de meta do dashboard.</p>
        </article>

        <article class="create-card">
          <div class="card-title">
            <div>
              <h2>Nova meta rapida</h2>
              <p>Simule uma meta para a proxima etapa do projeto.</p>
            </div>
          </div>

          <form @submit.prevent="saveGoal">
            <label>
              Area monitorada
              <input v-model="area" type="text" placeholder="Ex: Refeitorio" />
            </label>
            <label>
              Reducao desejada
              <input v-model="target" type="text" placeholder="Ex: 15%" />
            </label>
            <PrimaryButton :disabled="!canSaveGoal">Salvar meta</PrimaryButton>
          </form>
        </article>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref } from 'vue';
import { IonContent, IonPage } from '@ionic/vue';
import AppShell from '../components/AppShell.vue';
import PrimaryButton from '../components/PrimaryButton.vue';
import { addGoal, removeGoal, userGoals } from '../data/goals-store.js';

const area = ref('');
const target = ref('');
const canSaveGoal = computed(() => Boolean(area.value.trim()) && Boolean(target.value.trim()));
const overallProgress = computed(() => {
  if (!userGoals.value.length) {
    return 0;
  }

  const total = userGoals.value.reduce((sum, goal) => sum + Number(goal.progress || 0), 0);
  return Math.round(total / userGoals.value.length);
});
const heroMessage = computed(() => {
  if (!userGoals.value.length) {
    return 'Nenhuma meta cadastrada ainda. Crie uma meta real para acompanhar o progresso.';
  }

  return 'Monitore progresso por area e priorize onde a economia tem maior impacto.';
});

const saveGoal = () => {
  if (!canSaveGoal.value) {
    return;
  }

  addGoal({
    area: area.value,
    target: target.value,
  });

  area.value = '';
  target.value = '';
};

const deleteGoal = (goalId) => {
  removeGoal(goalId);
};
</script>

<style scoped>
.goals-hero {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 34%),
    var(--agua-petroleo);
  border-radius: 22px;
  color: var(--agua-branco);
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr auto;
  margin-bottom: 20px;
  padding: 26px;
}

.goals-hero > div {
  position: relative;
  z-index: 1;
}

.goals-hero span {
  color: rgba(255, 255, 255, 0.78) !important;
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.goals-hero h2 {
  color: #ffffff !important;
  font-size: clamp(22px, 4vw, 34px);
  line-height: 1.14;
  margin: 0;
  max-width: 650px;
}

.goals-hero p {
  color: rgba(255, 255, 255, 0.82) !important;
  font-size: 13px;
  margin: 12px 0 0;
}

.goals-hero strong {
  color: #ffffff !important;
  font-size: clamp(34px, 7vw, 58px);
  line-height: 1;
}

.goals-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.goal-card,
.create-card,
.empty-goals {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
  padding: 20px;
}

.goal-card {
  display: grid;
  gap: 18px;
}

.empty-goals {
  background:
    linear-gradient(135deg, rgba(31, 206, 195, 0.1), transparent 42%),
    var(--agua-branco);
  display: grid;
  gap: 8px;
}

.empty-goals span {
  color: #188b84;
  font-size: 12px;
  font-weight: 800;
}

.empty-goals h2 {
  color: var(--agua-petroleo);
  font-size: 20px;
  margin: 0;
}

.empty-goals p {
  color: var(--agua-suave);
  font-size: 13px;
  line-height: 1.65;
  margin: 0;
  max-width: 620px;
}

.goal-head {
  display: grid;
  gap: 14px;
}

.goal-head h2,
.card-title h2 {
  color: var(--agua-petroleo);
  font-size: 17px;
  margin: 0 0 7px;
}

.goal-head p,
.card-title p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.65;
  margin: 0;
}

.goal-head span {
  background: #e6f6f5;
  border-radius: 999px;
  color: #188b84;
  font-size: 11px;
  font-weight: 700;
  justify-self: start;
  padding: 7px 10px;
}

.goal-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.delete-goal {
  background: rgba(255, 79, 90, 0.1);
  border: 1px solid rgba(255, 79, 90, 0.28);
  border-radius: 999px;
  color: #e13f4b;
  cursor: pointer;
  font: 700 11px/1 Poppins, sans-serif;
  padding: 8px 11px;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.delete-goal:hover {
  background: rgba(255, 79, 90, 0.16);
  border-color: rgba(255, 79, 90, 0.44);
  transform: translateY(-1px);
}

.delete-goal:active {
  transform: translateY(0);
}

.progress-line {
  background: #e7eeee;
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.progress-line i {
  background: linear-gradient(90deg, var(--agua-agua), var(--agua-sucesso));
  border-radius: inherit;
  display: block;
  height: 100%;
}

.goal-foot {
  align-items: end;
  display: flex;
  justify-content: space-between;
}

.goal-foot strong {
  color: var(--agua-petroleo);
  font-size: 30px;
  line-height: 1;
}

.goal-foot small {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.45;
  max-width: 150px;
  text-align: right;
}

.create-card {
  margin-top: 20px;
}

form {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1fr auto;
  margin-top: 18px;
}

label {
  color: #31535d;
  display: grid;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
}

input {
  background: var(--agua-branco);
  border: 1px solid #d8e1e3;
  border-radius: 14px;
  color: var(--agua-texto);
  font: 400 14px Poppins, sans-serif;
  min-height: 52px;
  outline: none;
  padding: 0 14px;
}

form :deep(.primary) {
  align-self: end;
  min-width: 150px;
}

@media (max-width: 980px) {
  .goals-grid,
  form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .goals-hero {
    grid-template-columns: 1fr;
    padding: 22px;
  }
}
</style>
