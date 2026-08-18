import { Exercise } from '../lib/types';

export const EXERCISES: Exercise[] = [
  // Full body / compound, no equipment
  { id: 'squat-bw', name: 'Bodyweight Squat', focus: ['full_body', 'lower_body'], equipment: ['none', 'dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '12-15', restSeconds: 60 },
  { id: 'pushup', name: 'Push-Up', focus: ['full_body', 'upper_body'], equipment: ['none', 'dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '8-15', restSeconds: 60 },
  { id: 'lunge', name: 'Walking Lunge', focus: ['lower_body', 'full_body'], equipment: ['none', 'dumbbells'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '10-12/leg', restSeconds: 60 },
  { id: 'plank', name: 'Plank', focus: ['core'], equipment: ['none', 'dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '30-60s', restSeconds: 45 },
  { id: 'glute-bridge', name: 'Glute Bridge', focus: ['lower_body', 'core'], equipment: ['none', 'dumbbells'], level: ['beginner', 'intermediate'], sets: 3, reps: '15', restSeconds: 45 },
  { id: 'mountain-climber', name: 'Mountain Climbers', focus: ['cardio', 'core'], equipment: ['none'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '30s', restSeconds: 30 },
  { id: 'burpee', name: 'Burpee', focus: ['cardio', 'full_body'], equipment: ['none'], level: ['intermediate', 'advanced'], sets: 3, reps: '10-15', restSeconds: 45 },
  { id: 'jumping-jacks', name: 'Jumping Jacks', focus: ['cardio'], equipment: ['none'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '45s', restSeconds: 30, isCardio: true },
  { id: 'situp', name: 'Sit-Up', focus: ['core'], equipment: ['none', 'dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '15-20', restSeconds: 45 },
  { id: 'superman', name: 'Superman Hold', focus: ['core', 'full_body'], equipment: ['none'], level: ['beginner', 'intermediate'], sets: 3, reps: '20-30s', restSeconds: 30 },
  { id: 'high-knees', name: 'High Knees', focus: ['cardio'], equipment: ['none'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '30s', restSeconds: 30, isCardio: true },
  { id: 'pike-pushup', name: 'Pike Push-Up', focus: ['upper_body'], equipment: ['none'], level: ['intermediate', 'advanced'], sets: 3, reps: '8-12', restSeconds: 60 },
  { id: 'triceps-dip', name: 'Chair Triceps Dip', focus: ['upper_body'], equipment: ['none'], level: ['beginner', 'intermediate'], sets: 3, reps: '10-15', restSeconds: 45 },
  { id: 'step-up', name: 'Step-Up', focus: ['lower_body'], equipment: ['none', 'dumbbells'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '12/leg', restSeconds: 45 },
  { id: 'wall-sit', name: 'Wall Sit', focus: ['lower_body'], equipment: ['none'], level: ['beginner', 'intermediate'], sets: 3, reps: '30-45s', restSeconds: 45 },

  // Dumbbells
  { id: 'db-goblet-squat', name: 'Dumbbell Goblet Squat', focus: ['lower_body', 'full_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 4, reps: '8-12', restSeconds: 75 },
  { id: 'db-row', name: 'Dumbbell Bent-Over Row', focus: ['upper_body', 'full_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 4, reps: '8-12', restSeconds: 75 },
  { id: 'db-bench-press', name: 'Dumbbell Bench/Floor Press', focus: ['upper_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 4, reps: '8-12', restSeconds: 90 },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', focus: ['upper_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '8-12', restSeconds: 75 },
  { id: 'db-deadlift', name: 'Dumbbell Romanian Deadlift', focus: ['lower_body', 'full_body'], equipment: ['dumbbells', 'full_gym'], level: ['intermediate', 'advanced'], sets: 4, reps: '8-10', restSeconds: 90 },
  { id: 'db-lunge', name: 'Dumbbell Reverse Lunge', focus: ['lower_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '10/leg', restSeconds: 60 },
  { id: 'db-curl', name: 'Dumbbell Biceps Curl', focus: ['upper_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '10-15', restSeconds: 45 },
  { id: 'db-tricep-ext', name: 'Dumbbell Overhead Triceps Extension', focus: ['upper_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '10-15', restSeconds: 45 },
  { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raise', focus: ['upper_body'], equipment: ['dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '12-15', restSeconds: 45 },

  // Full gym
  { id: 'barbell-squat', name: 'Barbell Back Squat', focus: ['lower_body', 'full_body'], equipment: ['full_gym'], level: ['intermediate', 'advanced'], sets: 4, reps: '5-8', restSeconds: 120 },
  { id: 'barbell-deadlift', name: 'Barbell Deadlift', focus: ['full_body', 'lower_body'], equipment: ['full_gym'], level: ['intermediate', 'advanced'], sets: 4, reps: '5-8', restSeconds: 150 },
  { id: 'barbell-bench', name: 'Barbell Bench Press', focus: ['upper_body'], equipment: ['full_gym'], level: ['intermediate', 'advanced'], sets: 4, reps: '5-8', restSeconds: 120 },
  { id: 'lat-pulldown', name: 'Lat Pulldown', focus: ['upper_body'], equipment: ['full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 4, reps: '8-12', restSeconds: 75 },
  { id: 'leg-press', name: 'Leg Press', focus: ['lower_body'], equipment: ['full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 4, reps: '10-12', restSeconds: 90 },
  { id: 'cable-row', name: 'Seated Cable Row', focus: ['upper_body'], equipment: ['full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '10-12', restSeconds: 75 },
  { id: 'leg-curl', name: 'Leg Curl Machine', focus: ['lower_body'], equipment: ['full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 3, reps: '10-12', restSeconds: 60 },
  { id: 'cable-crunch', name: 'Cable Crunch', focus: ['core'], equipment: ['full_gym'], level: ['intermediate', 'advanced'], sets: 3, reps: '12-15', restSeconds: 45 },

  // Cardio machines / activities
  { id: 'treadmill', name: 'Treadmill Intervals', focus: ['cardio'], equipment: ['none', 'dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 1, reps: '15-20 min', restSeconds: 0, isCardio: true },
  { id: 'jump-rope', name: 'Jump Rope', focus: ['cardio'], equipment: ['none', 'dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 4, reps: '60s', restSeconds: 30, isCardio: true },
  { id: 'row-machine', name: 'Rowing Machine', focus: ['cardio', 'full_body'], equipment: ['full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 1, reps: '10-15 min', restSeconds: 0, isCardio: true },
  { id: 'bike', name: 'Stationary Bike', focus: ['cardio'], equipment: ['none', 'dumbbells', 'full_gym'], level: ['beginner', 'intermediate', 'advanced'], sets: 1, reps: '15-20 min', restSeconds: 0, isCardio: true },
];
