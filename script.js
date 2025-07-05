        document.addEventListener('DOMContentLoaded', () => {
            const $ = (selector) => document.querySelector(selector);
            const $$ = (selector) => document.querySelectorAll(selector);

            const navItems = $$('.nav-item');
            const appSections = $$('.app-section');
            const bottomNav = $('.bottom-nav');
            const sidebarNav = $('.sidebar-nav');

            // --- Core Navigation Logic ---
            function showSection(sectionId) {
                appSections.forEach(section => {
                    section.classList.remove('active');
                    section.style.display = 'none'; 
                });

                const activeSection = $(`#${sectionId}`);
                activeSection.style.display = (sectionId === 'login') ? 'flex' : 'block';

                setTimeout(() => {
                    activeSection.classList.add('active');
                }, 10);

                // Update active state for both navs
                navItems.forEach(item => item.classList.remove('active'));
                if (sectionId !== 'login') {
                    $(`.nav-item[data-section="${sectionId}"]`).classList.add('active');
                // Check if we are on desktop to show sidebar or mobile for bottom nav
                    if (window.innerWidth >= 768) {
                         sidebarNav.style.display = 'flex';
                         bottomNav.style.display = 'none';
                    } else {
                        bottomNav.style.display = 'flex';
                        sidebarNav.style.display = 'none';
                    }
                } else {
                    bottomNav.style.display = 'none';
                    sidebarNav.style.display = 'none';
                }
            }

            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSection(item.dataset.section);
                });
            });

            window.showSection = showSection; // Make available globally

            // --- User Data Model ---
            const user = {
                name: localStorage.getItem('currentUser') || '',
                weight: parseFloat(localStorage.getItem('userWeight')) || 0,
                height: parseFloat(localStorage.getItem('userHeight')) || 0,
                bmi: 0,
                bmiStatus: '',
                moodEmoji: '😄',
                moodText: 'Happy',
                health: 80, 
                energy: 70, 
                wellnessMood: 90, 
                xp: parseInt(localStorage.getItem('userXp')) || 1250,
                level: parseInt(localStorage.getItem('userLevel')) || 5,
                xpToNextLevel: 2500, 
                waterIntake: parseFloat(localStorage.getItem('waterIntake')) || 0, 
                waterGoal: 2000, 

                // Daily data 
                dailyMissions: JSON.parse(localStorage.getItem('dailyMissions')) || [],
                customHabits: JSON.parse(localStorage.getItem('customHabits')) || [],
                foodLog: JSON.parse(localStorage.getItem('foodLog')) || [],
                lastLoginDate: localStorage.getItem('lastLoginDate') || ''
            };

            const defaultDailyMissions = [
                { id: 'mission1', text: 'เดิน 6,000 ก้าว', completed: false, xp: 50, health: 5, energy: 3, mood: 3 },
                { id: 'mission2', text: 'ดื่มน้ำ 8 แก้ว (2000 มล.)', completed: false, xp: 40, health: 4, energy: 2, mood: 2 },
                { id: 'mission3', text: 'นอนก่อน 5 ทุ่ม', completed: false, xp: 60, health: 7, energy: 5, mood: 5 },
                { id: 'mission4', text: 'กินผัก 1 มื้อ', completed: false, xp: 30, health: 3, energy: 1, mood: 1 },
                { id: 'mission5', text: 'ฝึกสติ 5 นาที', completed: false, xp: 45, health: 2, energy: 2, mood: 6 }
            ];

            // Reset daily missions and water 
            function resetDailyDataIfNewDay() {
                const today = new Date().toDateString();
                if (user.lastLoginDate !== today) {
                    user.dailyMissions = defaultDailyMissions.map(m => ({ ...m, completed: false }));
                    user.waterIntake = 0;
                    user.lastLoginDate = today;
                    localStorage.setItem('dailyMissions', JSON.stringify(user.dailyMissions));
                    localStorage.setItem('waterIntake', user.waterIntake);
                    localStorage.setItem('lastLoginDate', user.lastLoginDate);
                    console.log('Daily data reset for new day.');
                }
            }


            // Calculate BMI and update health based on BMI
            function calculateBMI() {
                if (user.weight > 0 && user.height > 0) {
                    const heightInMeters = user.height / 100;
                    user.bmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(2);

                    let healthAdjustment = 0;
                    if (user.bmi < 18.5) {
                        user.bmiStatus = 'น้ำหนักน้อยเกินไป 😟';
                        healthAdjustment = -10;
                        user.moodText = 'รู้สึกอ่อนเพลีย';
                    } else if (user.bmi >= 18.5 && user.bmi <= 24.9) {
                        user.bmiStatus = 'น้ำหนักปกติ 👍';
                        healthAdjustment = 0; // No adjustment for normal BMI
                    } else if (user.bmi >= 25 && user.bmi <= 29.9) {
                        user.bmiStatus = 'น้ำหนักเกิน 😐';
                        healthAdjustment = -5;
                        user.moodText = 'รู้สึกอึดอัด';
                    } else {
                        user.bmiStatus = 'โรคอ้วน 😥';
                        healthAdjustment = -15;
                        user.moodText = 'รู้สึกไม่สบายตัว';
                    }
                    // Apply BMI health adjustment only once or gradually, not on every re-render
                    // For simplicity, we just set a baseline mood/health based on BMI
                    user.health = Math.max(0, Math.min(100, user.health + healthAdjustment));
                    updateAvatarAppearance();
                } else {
                    user.bmi = '--';
                    user.bmiStatus = 'ไม่สามารถคำนวณได้';
                }
            }

            // Function to update avatar appearance (visual)
            function updateAvatarAppearance() {
                const avatar = $('#user-avatar');
                avatar.classList.remove('healthy', 'unhealthy', 'normal');

                let avatarSrc = `https://via.placeholder.com/160/ADD8E6/000000?text=${user.name ? user.name.substring(0,1).toUpperCase() : '?'}`;

                if (user.health >= 80) {
                    avatar.classList.add('healthy');
                    avatarSrc = 'https://via.placeholder.com/160/66BB6A/FFFFFF?text=💪'; // Healthy avatar
                } else if (user.health < 50) {
                    avatar.classList.add('unhealthy');
                    avatarSrc = 'https://via.placeholder.com/160/EF5350/FFFFFF?text=😥'; // Unhealthy avatar
                } else {
                    avatar.classList.add('normal');
                }
                avatar.src = avatarSrc;
            }

            // Helper to get CSS variable value
            const getCssVar = (variableName) => getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();

            // --- Login/Logout Logic ---
            const performLogout = () => {
                if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
                    localStorage.clear(); // Clear all user data
                    user.name = '';
                    user.weight = 0;
                    user.height = 0;
                    user.moodEmoji = '😄';
                    user.moodText = 'Happy';
                    user.health = 80;
                    user.energy = 70;
                    user.wellnessMood = 90;
                    user.xp = 1250;
                    user.level = 5;
                    user.waterIntake = 0;
                    user.dailyMissions = [];
                    user.customHabits = [];
                    user.foodLog = [];
                    user.lastLoginDate = '';

                    $('#username-input').value = '';
                    $('#weight-input').value = '';
                    $('#height-input').value = '';

                    showSection('login');
                }
            };

            $('#start-adventure-btn').addEventListener('click', () => {
                const username = $('#username-input').value.trim();
                const weight = parseFloat($('#weight-input').value);
                const height = parseFloat($('#height-input').value);

                if (username && weight > 0 && height > 0) {
                    user.name = username;
                    user.weight = weight;
                    user.height = height;

                    // Initialize daily missions on first login if not set
                    if (user.dailyMissions.length === 0) {
                         user.dailyMissions = defaultDailyMissions.map(m => ({ ...m, completed: false }));
                         localStorage.setItem('dailyMissions', JSON.stringify(user.dailyMissions));
                    }

                    localStorage.setItem('currentUser', username);
                    localStorage.setItem('userWeight', weight);
                    localStorage.setItem('userHeight', height);
                    localStorage.setItem('userXp', user.xp);
                    localStorage.setItem('userLevel', user.level);
                    localStorage.setItem('waterIntake', user.waterIntake);
                    localStorage.setItem('lastLoginDate', new Date().toDateString());

                    calculateBMI();
                    updateHomeUI();
                    renderFoodLog();
                    renderMissions(user.dailyMissions, $('#daily-missions-list'), 'mission');
                    renderMissions(user.customHabits, $('#custom-habit-list'), 'habit');
                    updateFoodTip();
                    updatePlanSummary();

                    showSection('home');
                } else {
                    alert('โปรดระบุชื่อ, น้ำหนัก, และส่วนสูงให้ถูกต้อง!');
                }
            });

            $('#logout-btn-sidebar').addEventListener('click', performLogout);
            $('#logout-btn-account').addEventListener('click', performLogout);

            // --- Home Section UI Update ---
            const updateHomeUI = () => {
                $('#display-username').textContent = user.name;
                $('#avatar-mood').textContent = user.moodEmoji;
                $('#current-mood').textContent = user.moodText;

                $('.status-bar.health .bar-fill').style.width = `${user.health}%`;
                $('#health-value').textContent = `${user.health}%`;
                $('.status-bar.energy .bar-fill').style.width = `${user.energy}%`;
                $('#energy-value').textContent = `${user.energy}%`;
                $('.status-bar.mood .bar-fill').style.width = `${user.wellnessMood}%`;
                $('#mood-value').textContent = `${user.wellnessMood}%`;

                $('#xp-points').textContent = user.xp;
                $('#user-level').textContent = user.level;
                const levelProgress = (user.xp / user.xpToNextLevel) * 100;
                $('.level-progress-bar .progress-fill').style.width = `${levelProgress}%`;

                // Render completed missions on Home
                const missionList = $('#daily-missions-completed');
                missionList.innerHTML = '';
                user.dailyMissions.filter(m => m.completed).forEach(mission => {
                    const li = document.createElement('li');
                    li.innerHTML = `${mission.text} <i class="fas fa-check-circle"></i>`;
                    missionList.appendChild(li);
                });
                user.customHabits.filter(h => h.completed).forEach(habit => {
                    const li = document.createElement('li');
                    li.innerHTML = `${habit.text} <i class="fas fa-check-circle"></i>`;
                    missionList.appendChild(li);
                });


                // Update Account section
                $('#account-username').textContent = user.name;
                $('#account-weight').textContent = user.weight;
                $('#account-height').textContent = user.height;
                $('#account-bmi').textContent = user.bmi;
                $('#account-bmi-status').textContent = user.bmiStatus;

                updateAvatarAppearance(); // Ensure avatar appearance is updated
            };

            // --- Food Section Logic ---
            const foodTips = [
                "คุณยังไม่ได้กินโปรตีนมากพอวันนี้ ลองเพิ่มเนื้อสัตว์หรือถั่วดูสิ!",
                "อย่าลืมกินผักและผลไม้เพื่อวิตามินและใยอาหารนะ!",
                "ลดน้ำตาลในเครื่องดื่มลงหน่อย อวตารของคุณจะได้ไม่ป่วยง่าย!",
                "ดื่มน้ำให้เพียงพอ 2000 มล. ต่อวันช่วยให้อวตารของคุณสดชื่น!",
                "ลองเปลี่ยนของทอดเป็นอบหรือนึ่งดูสิ เพื่อสุขภาพที่ดีขึ้น!"
            ];
            let currentTipIndex = 0;

            const analyzeFood = (foodText) => {
                foodText = foodText.toLowerCase();
                if (foodText.includes('น้ำอัดลม') || foodText.includes('พิซซ่า') || foodText.includes('เค้ก') || foodText.includes('ของทอด') || foodText.includes('จั๊งค์ฟู้ด')) {
                    return { impact: 'unhealthy', message: 'อาหารนี้มีแคลอรี่/น้ำตาลสูง', healthChange: -5, energyChange: -3, moodChange: -2 };
                } else if (foodText.includes('สลัด') || foodText.includes('ผัก') || foodText.includes('อกไก่') || foodText.includes('ผลไม้') || foodText.includes('ข้าวกล้อง')) {
                    return { impact: 'healthy', message: 'ดีต่อสุขภาพ', healthChange: +5, energyChange: +3, moodChange: +2 };
                }
                return { impact: 'neutral', message: 'อาหารทั่วไป', healthChange: 0, energyChange: 0, moodChange: 0 };
            };

            const renderFoodLog = () => {
                const foodListElement = $('#food-list');
                foodListElement.innerHTML = '';
                if (user.foodLog.length === 0) {
                    foodListElement.innerHTML = '<li>ยังไม่มีรายการอาหารวันนี้</li>';
                }
                user.foodLog.forEach(log => {
                    const li = document.createElement('li');
                    li.textContent = log.name;
                    if (log.healthImpact === 'unhealthy') {
                        li.innerHTML += `<div class="food-warning"><i class="fas fa-exclamation-triangle"></i> ${log.message}</div>`;
                    } else if (log.healthImpact === 'healthy') {
                        li.innerHTML += `<div class="food-good">👍 ${log.message}</div>`;
                    }
                    foodListElement.appendChild(li);
                });
            };

            const updateFoodTip = () => {
                currentTipIndex = (currentTipIndex + 1) % foodTips.length;
                $('#food-tip').textContent = foodTips[currentTipIndex];
            };

            const updateWaterTracker = () => {
                $('#water-total-ml').textContent = user.waterIntake;
                $('#water-goal-ml').textContent = user.waterGoal;

                const waterImpactMessage = $('#water-impact-message');
                waterImpactMessage.classList.remove('food-good', 'food-warning');

                if (user.waterIntake >= user.waterGoal) {
                    waterImpactMessage.textContent = 'ดื่มน้ำได้ตามเป้าหมายแล้ว! 👍';
                    waterImpactMessage.classList.add('food-good');
                    user.health = Math.min(100, user.health + 5); // Reward for reaching goal
                } else if (user.waterIntake < user.waterGoal / 2 && user.foodLog.length > 0) { // If user has eaten but not much water
                    waterImpactMessage.textContent = 'ดื่มน้ำเพิ่มอีกหน่อยนะ! 💧';
                    waterImpactMessage.classList.add('food-warning');
                } else {
                    waterImpactMessage.textContent = 'ดื่มน้ำดีมาก!';
                    waterImpactMessage.classList.add('food-good');
                }
                localStorage.setItem('waterIntake', user.waterIntake);
                updateHomeUI(); // Refresh home to show status changes
            };


            $('#add-food-btn').addEventListener('click', () => {
                const foodInput = $('#food-input');
                const foodText = foodInput.value.trim();
                if (!foodText) return;

                const analysis = analyzeFood(foodText);
                user.foodLog.push({ name: foodText, healthImpact: analysis.impact, message: analysis.message });
                localStorage.setItem('foodLog', JSON.stringify(user.foodLog));

                user.health = Math.min(100, Math.max(0, user.health + analysis.healthChange));
                user.energy = Math.min(100, Math.max(0, user.energy + analysis.energyChange));
                user.wellnessMood = Math.min(100, Math.max(0, user.wellnessMood + analysis.moodChange));

                const avatarFoodImpactElement = $('#avatar-food-impact');
                if (analysis.impact === 'unhealthy') {
                    avatarFoodImpactElement.innerHTML = `อวตารของคุณดู <strong>แย่ลง!</strong>`;
                    avatarFoodImpactElement.querySelector('strong').style.color = getCssVar('--avatar-unhealthy-color');
                } else if (analysis.impact === 'healthy') {
                    avatarFoodImpactElement.innerHTML = `อวตารของคุณดู <strong>สดใสขึ้น!</strong>`;
                    avatarFoodImpactElement.querySelector('strong').style.color = getCssVar('--avatar-healthy-color');
                } else {
                    avatarFoodImpactElement.innerHTML = `อวตารของคุณดู <strong>ปกติ</strong>`;
                    avatarFoodImpactElement.querySelector('strong').style.color = getCssVar('--avatar-neutral-color');
                }

                renderFoodLog();
                foodInput.value = '';
                updateHomeUI();
                updateFoodTip();
            });

            $('#food-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') $('#add-food-btn').click();
            });

            $('#add-water-btn').addEventListener('click', () => {
                const amount = parseFloat($('#water-amount-input').value);
                if (amount > 0) {
                    user.waterIntake += amount;
                    updateWaterTracker();
                    // Optionally adjust mood/energy slightly with each intake
                    user.energy = Math.min(100, user.energy + 1);
                    user.wellnessMood = Math.min(100, user.wellnessMood + 1);
                    updateHomeUI();
                } else {
                    alert('โปรดระบุปริมาณน้ำที่ถูกต้อง');
                }
            });

            $('#quick-meal-btn').addEventListener('click', () => {
                $('#food-input').value = 'มื้อด่วน (อาหารทั่วไป)';
                $('#add-food-btn').click();
                user.energy = Math.min(100, user.energy + 5);
                updateHomeUI();
            });

            // --- Plan Section Logic ---
            const renderMissions = (missions, listElement, type) => {
                listElement.innerHTML = '';
                if (missions.length === 0) {
                    listElement.innerHTML = '<li>ยังไม่มีภารกิจหรือนิสัย</li>';
                }
                missions.forEach(item => {
                    const li = document.createElement('li');
                    li.dataset[type + 'Id'] = item.id;
                    li.innerHTML = `<label><input type="checkbox" ${item.completed ? 'checked' : ''}> ${item.text}</label>`;
                    listElement.appendChild(li);
                });
                localStorage.setItem(type === 'mission' ? 'dailyMissions' : 'customHabits', JSON.stringify(missions));
                updatePlanSummary();
            };

            const handleMissionChange = (e, missions, type) => {
                if (e.target.type === 'checkbox') {
                    const itemId = e.target.closest('li').dataset[type + 'Id'];
                    const item = missions.find(m => m.id === itemId);
                    if (item) {
                        item.completed = e.target.checked;
                        if (item.completed) {
                            user.xp += item.xp;
                            user.wellnessMood = Math.min(100, user.wellnessMood + item.mood);
                            user.energy = Math.min(100, user.energy + item.energy);
                            user.moodText = 'รู้สึกยอดเยี่ยม!';
                        } else {
                            // Deduct half if unchecked, prevent negative XP/status
                            user.xp = Math.max(0, user.xp - Math.floor(item.xp / 2));
                            user.wellnessMood = Math.max(0, user.wellnessMood - Math.floor(item.mood / 2));
                            user.energy = Math.max(0, user.energy - Math.floor(item.energy / 2));
                            user.moodText = 'รู้สึกแย่ลงเล็กน้อย';
                        }
                        localStorage.setItem(type === 'mission' ? 'dailyMissions' : 'customHabits', JSON.stringify(missions));
                        updateHomeUI();
                        updatePlanSummary();
                    }
                }
            };

            $('#daily-missions-list').addEventListener('change', (e) => handleMissionChange(e, user.dailyMissions, 'mission'));
            $('#custom-habit-list').addEventListener('change', (e) => handleMissionChange(e, user.customHabits, 'habit'));

            $('#add-mission-btn').addEventListener('click', () => {
                const newMissionText = prompt('ป้อนภารกิจประจำวันใหม่:');
                if (newMissionText) {
                    const newId = 'mission' + Date.now();
                    user.dailyMissions.push({ id: newId, text: newMissionText, completed: false, xp: 30, health: 2, energy: 1, mood: 2 }); // Default values
                    renderMissions(user.dailyMissions, $('#daily-missions-list'), 'mission');
                }
            });

            $('#random-mission-btn').addEventListener('click', () => {
                // Remove existing non-completed default missions for a fresh start (optional)
                user.dailyMissions = user.dailyMissions.filter(m => m.completed);

                // Get a random mission from default list that is not already completed
                const availableMissions = defaultDailyMissions.filter(dm => !user.dailyMissions.some(um => um.id === dm.id && um.completed));
                if (availableMissions.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableMissions.length);
                    const newMission = { ...availableMissions[randomIndex], id: 'mission' + Date.now(), completed: false }; // Create new ID to allow multiple instances
                    user.dailyMissions.push(newMission);
                    renderMissions(user.dailyMissions, $('#daily-missions-list'), 'mission');
                    alert(`ได้รับภารกิจใหม่: "${newMission.text}"`);
                } else {
                    alert('คุณทำภารกิจพื้นฐานครบหมดแล้ว!');
                }
            });


            $('#add-habit-btn').addEventListener('click', () => {
                const newHabitText = $('#custom-habit-input').value.trim();
                if (newHabitText) {
                    const newId = 'habit' + Date.now();
                    user.customHabits.push({ id: newId, text: newHabitText, completed: false, xp: 20, health: 1, energy: 1, mood: 1 }); // Default values
                    renderMissions(user.customHabits, $('#custom-habit-list'), 'habit');
                    $('#custom-habit-input').value = '';
                }
            });

            const updatePlanSummary = () => {
                const completedMissions = user.dailyMissions.filter(m => m.completed).length + user.customHabits.filter(h => h.completed).length;
                const totalMissions = user.dailyMissions.length + user.customHabits.length;
                const progressPercent = totalMissions > 0 ? ((completedMissions / totalMissions) * 100).toFixed(0) : 0;

                $('#missions-completed-count').textContent = completedMissions;
                $('#missions-total-count').textContent = totalMissions;
                $('#missions-progress-percent').textContent = `${progressPercent}%`;
            };

            // --- Graph Section Logic (using Chart.js) ---
            const ctx = $('#myChart').getContext('2d');
            let myChart; // Declare chart variable globally to re-use

            const updateChart = (period) => {
                if (myChart) {
                    myChart.destroy(); // Destroy old chart instance
                }

                let labels, healthData, moodData, xpData;

                // Dummy data based on period for demonstration
                if (period === 'week') {
                    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    healthData = [user.health - 5, user.health - 2, user.health, user.health + 2, user.health + 1, user.health + 3, user.health + 5];
                    moodData = [user.wellnessMood - 10, user.wellnessMood - 5, user.wellnessMood, user.wellnessMood - 2, user.wellnessMood + 3, user.wellnessMood + 5, user.wellnessMood + 10];
                    xpData = [user.xp - 100, user.xp - 50, user.xp, user.xp + 20, user.xp + 50, user.xp + 100, user.xp + 150];
                } else if (period === 'month') {
                    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                    healthData = [user.health - 10, user.health - 5, user.health + 3, user.health + 7];
                    moodData = [user.wellnessMood - 15, user.wellnessMood - 7, user.wellnessMood + 5, user.wellnessMood + 12];
                    xpData = [user.xp - 300, user.xp - 100, user.xp + 150, user.xp + 400];
                } else if (period === 'year') {
                    labels = ['Q1', 'Q2', 'Q3', 'Q4'];
                    healthData = [user.health - 20, user.health - 10, user.health + 5, user.health + 15];
                    moodData = [user.wellnessMood - 25, user.wellnessMood - 15, user.wellnessMood + 8, user.wellnessMood + 20];
                    xpData = [user.xp - 1000, user.xp - 500, user.xp + 200, user.xp + 800];
                }

                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            { label: 'สุขภาพ', data: healthData, borderColor: getCssVar('--health-color'), backgroundColor: 'rgba(102, 187, 106, 0.2)', tension: 0.3, fill: true },
                            { label: 'อารมณ์', data: moodData, borderColor: getCssVar('--mood-color'), backgroundColor: 'rgba(255, 179, 0, 0.2)', tension: 0.3, fill: true },
                            { label: 'XP', data: xpData, borderColor: getCssVar('--primary-color'), backgroundColor: 'rgba(92, 107, 192, 0.2)', tension: 0.3, fill: true }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true } },
                        plugins: { legend: { position: 'top' } }
                    }
                });

                // Update chart controls active state
                $$('.chart-controls button').forEach(btn => btn.classList.remove('active'));
                $(`.chart-controls button[data-period="${period}"]`).classList.add('active');
            };

            $$('.chart-controls button').forEach(button => {
                button.addEventListener('click', (e) => {
                    updateChart(e.target.dataset.period);
                });
            });

            // Dummy data for focus timer and health trend
            $('#total-focus-time').textContent = '180 นาที';
            $('#best-focus-day').textContent = 'วันอังคาร';
            $('#health-trend-message').innerHTML = `"สัปดาห์นี้ คุณรู้สึก <strong>ดีขึ้น 13%</strong>! ทำได้ดีมาก!"`;


            // --- Account Section Logic ---
            const editProfileBtn = $('#edit-profile-btn');
            const editProfileFields = $('#edit-profile-fields');
            const saveProfileBtn = $('#save-profile-btn');
            const cancelEditBtn = $('#cancel-edit-btn');
            const editUsernameInput = $('#edit-username-input');
            const editWeightInput = $('#edit-weight-input');
            const editHeightInput = $('#edit-height-input');

            editProfileBtn.addEventListener('click', () => {
                editUsernameInput.value = user.name;
                editWeightInput.value = user.weight;
                editHeightInput.value = user.height;
                editProfileFields.classList.add('active');
                editProfileBtn.style.display = 'none'; // Hide edit button
            });

            saveProfileBtn.addEventListener('click', () => {
                const newUsername = editUsernameInput.value.trim();
                const newWeight = parseFloat(editWeightInput.value);
                const newHeight = parseFloat(editHeightInput.value);

                if (newUsername && newWeight > 0 && newHeight > 0) {
                    user.name = newUsername;
                    user.weight = newWeight;
                    user.height = newHeight;

                    localStorage.setItem('currentUser', user.name);
                    localStorage.setItem('userWeight', user.weight);
                    localStorage.setItem('userHeight', user.height);

                    calculateBMI();
                    updateHomeUI(); // Refresh Home and Account sections
                    editProfileFields.classList.remove('active');
                    editProfileBtn.style.display = 'block'; // Show edit button again
                    alert('ข้อมูลโปรไฟล์ถูกบันทึกแล้ว!');
                } else {
                    alert('โปรดกรอกข้อมูลให้ครบถ้วนและถูกต้อง!');
                }
            });

            cancelEditBtn.addEventListener('click', () => {
                editProfileFields.classList.remove('active');
                editProfileBtn.style.display = 'block'; // Show edit button again
            });


            // --- Initialization on Load ---
            resetDailyDataIfNewDay(); // Check and reset daily data
            calculateBMI(); // Calculate BMI first
            updateHomeUI(); // Update UI with current user data
            renderFoodLog(); // Render any saved food items
            updateWaterTracker(); // Update water tracker display
            renderMissions(user.dailyMissions, $('#daily-missions-list'), 'mission'); // Render daily missions
            renderMissions(user.customHabits, $('#custom-habit-list'), 'habit'); // Render custom habits
            updateFoodTip(); // Set initial food tip
            updatePlanSummary(); // Update plan summary on load
            updateChart('week'); // Initialize chart with weekly data

            // Show Login if no username, else show Home
            if (!user.name) {
                showSection('login');
            } else {
                showSection('home');
            }

            // Adjust display of navigation on resize
            window.addEventListener('resize', () => {
                if (user.name) { // Only adjust if logged in
                    if (window.innerWidth >= 768) {
                        sidebarNav.style.display = 'flex';
                        bottomNav.style.display = 'none';
                    } else {
                        bottomNav.style.display = 'flex';
                        sidebarNav.style.display = 'none';
                    }
                }
            });
        });