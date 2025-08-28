document.addEventListener('DOMContentLoaded', () => {
  // --- Variables / Defaults ---
  let money = 0;
  let manaPerClick = 1;
  let autoMana = 0;
  let prestigeLevel = 0;
  let prestigePrice = 5000;
  let autoInterval = 1000; // ms
  let extraMoneyPerCrystal = 0; // Bonus money added when a crystal fills

  let upgradeMPCPrice = 50;
  let upgradeAutoPrice = 100;
  let upgradeCrystalPrice = 1000;
  let upgradeAutoSpeedPrice = 500;
  let upgradeExtraMoneyPrice = 500;

  const crystalsContainer = document.getElementById('crystals-container');
  const menuButtons = document.querySelectorAll('.menu-btn');
  const menus = document.querySelectorAll('.menu');
  const crystalColors = ['#6ec1ff','#ff6e6e','#6eff6e','#ffed6e','#ff6eff'];
  let crystals = [];
  let autoManaInterval = null;

  // --- Menüumschaltung ---
  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      menus.forEach(menu => menu.classList.remove('active'));
      const target = document.getElementById(btn.dataset.menu);
      if (target) target.classList.add('active');
    });
  });

  // --- UI Update ---
  function updateUI() {
    document.getElementById('money').innerText = money;
    document.getElementById('mpc').innerText = manaPerClick;
    document.getElementById('prestigeLevel').innerText = prestigeLevel;
    document.getElementById('prestigePrice').innerText = prestigePrice;

    // Upgrade-Preise anzeigen
    document.getElementById('upgradeMPCPrice').innerText = upgradeMPCPrice;
    document.getElementById('upgradeAutoPrice').innerText = upgradeAutoPrice;
    document.getElementById('upgradeCrystalPrice').innerText = upgradeCrystalPrice;
    document.getElementById('upgradeExtraMoneyPrice').innerText = upgradeExtraMoneyPrice;
    document.getElementById('upgradeAutoSpeedPrice').innerText = upgradeAutoSpeedPrice;
  }

  // --- Kristall erstellen ---
  function createCrystal(colorIndex, maxMana, moneyValue) {
    const crystal = document.createElement('div');
    crystal.classList.add('crystal');
    crystal.dataset.mana = 0;
    crystal.dataset.maxmana = maxMana;
    crystal.dataset.money = moneyValue;
    crystal.dataset.color = colorIndex;
    crystal.style.backgroundColor = crystalColors[colorIndex % crystalColors.length];

    const fill = document.createElement('div');
    fill.classList.add('crystal-fill');
    crystal.appendChild(fill);

    crystal.addEventListener('click', () => addManaToCrystal(crystal, manaPerClick));

    crystalsContainer.appendChild(crystal);
    crystals.push(crystal);
    updateFill(crystal);
  }

  // --- Mana hinzufügen / Geld vergeben ---
  function addManaToCrystal(crystal, amount) {
    let mana = parseInt(crystal.dataset.mana, 10) || 0;
    const maxMana = parseInt(crystal.dataset.maxmana, 10) || 1;
    mana += amount;

    if (mana >= maxMana) {
      const baseMoney = parseInt(crystal.dataset.money, 10) || 0;
      const gained = baseMoney + extraMoneyPerCrystal;
      money += gained;
      mana = mana - maxMana;
      showPopUp(crystal, `+${gained} 💰`);
    } else {
      showPopUp(crystal, `+${amount}`);
    }

    crystal.dataset.mana = mana;
    updateFill(crystal);
    updateUI();
    saveGame(); // speichere nach Änderung
  }

  function updateFill(crystal) {
    const fill = crystal.querySelector('.crystal-fill');
    const mana = parseInt(crystal.dataset.mana, 10) || 0;
    const maxMana = parseInt(crystal.dataset.maxmana, 10) || 1;
    const percent = Math.round((mana / maxMana) * 100);
    fill.style.height = Math.max(0, Math.min(100, percent)) + '%';
  }

  function showPopUp(crystal, text) {
    const pop = document.createElement('div');
    pop.classList.add('pop-up');
    pop.innerText = text;
    crystal.appendChild(pop);
    setTimeout(() => {
      pop.remove();
    }, 900);
  }

  // --- Automatik Intervall (start/stop helper) ---
  function startAutoInterval() {
    if (autoManaInterval) clearInterval(autoManaInterval);
    autoManaInterval = setInterval(() => {
      if (autoMana > 0 && crystals.length > 0) {
        crystals.forEach(crystal => addManaToCrystal(crystal, autoMana));
      }
    }, autoInterval);
  }

  // --- Shop Buttons ---
  document.getElementById('buyMPC').addEventListener('click', () => {
    if (money >= upgradeMPCPrice) {
      money -= upgradeMPCPrice;
      manaPerClick += 1;
      upgradeMPCPrice = Math.floor(upgradeMPCPrice * 1.5);
      updateUI();
      saveGame();
    }
  });

  document.getElementById('buyAuto').addEventListener('click', () => {
    if (money >= upgradeAutoPrice) {
      money -= upgradeAutoPrice;
      autoMana += 1;
      upgradeAutoPrice = Math.floor(upgradeAutoPrice * 1.5);
      updateUI();
      saveGame();
    }
  });

  document.getElementById('buyCrystal').addEventListener('click', () => {
    if (money >= upgradeCrystalPrice) {
      money -= upgradeCrystalPrice;
      const colorIndex = crystals.length % crystalColors.length;
      const newMax = 10 + crystals.length * 10;
      const newMoney = 10 + crystals.length * 20;
      createCrystal(colorIndex, newMax, newMoney);
      upgradeCrystalPrice = Math.floor(upgradeCrystalPrice * 2);
      updateUI();
      saveGame();
    }
  });

  // Mehr Geld pro gefülltem Kristall
  document.getElementById('buyExtraMoney').addEventListener('click', () => {
    if (money >= upgradeExtraMoneyPrice) {
      money -= upgradeExtraMoneyPrice;
      extraMoneyPerCrystal += 5; // increment bonus
      upgradeExtraMoneyPrice = Math.floor(upgradeExtraMoneyPrice * 2);
      updateUI();
      saveGame();
    }
  });

  // Schnellere Automatik (Intervall verkleinern)
  document.getElementById('buyAutoSpeed').addEventListener('click', () => {
    if (money >= upgradeAutoSpeedPrice) {
      money -= upgradeAutoSpeedPrice;
      autoInterval = Math.max(100, autoInterval - 100);
      upgradeAutoSpeedPrice = Math.floor(upgradeAutoSpeedPrice * 2);
      startAutoInterval();
      updateUI();
      saveGame();
    }
  });

  // Prestige
  document.getElementById('doPrestige').addEventListener('click', () => {
    if (money >= prestigePrice) {
      money = 0;
      prestigeLevel += 1;
      manaPerClick = prestigeLevel * 2;
      // Bonus pro Prestige
      autoMana = 0;
      crystalsContainer.innerHTML = '';
      crystals = [];
      createCrystal(0, 10, 10); // zurücksetzen
      prestigePrice = Math.floor(prestigePrice * 1.5);

      // Reset upgrade prices to defaults
      upgradeMPCPrice = 50;
      upgradeAutoPrice = 100;
      upgradeCrystalPrice = 1000;
      upgradeExtraMoneyPrice = 500;
      upgradeAutoSpeedPrice = 500;
      extraMoneyPerCrystal = 0;
      autoInterval = 1000;
      startAutoInterval();
      updateUI();
      saveGame();
    }
  });

  // Reset-Button
  document.getElementById('resetGame').addEventListener('click', () => {
    localStorage.removeItem('manaClickerSave');
    location.reload();
  });

  // --- Save / Load ---
  function saveGame() {
    const gameData = {
      money,
      manaPerClick,
      autoMana,
      prestigeLevel,
      prestigePrice,
      upgradeMPCPrice,
      upgradeAutoPrice,
      upgradeCrystalPrice,
      upgradeAutoSpeedPrice,
      upgradeExtraMoneyPrice,
      extraMoneyPerCrystal,
      autoInterval,
      crystals: crystals.map(c => ({
        color: c.dataset.color,
        mana: c.dataset.mana,
        maxmana: c.dataset.maxmana,
        money: c.dataset.money
      }))
    };
    try {
      localStorage.setItem('manaClickerSave', JSON.stringify(gameData));
    } catch (e) {
      console.warn('Save failed', e);
    }
  }

  function loadGame() {
    const saved = localStorage.getItem('manaClickerSave');
    if (!saved) return;
    try {
      const savedData = JSON.parse(saved);

      money = savedData.money ?? money;
      manaPerClick = savedData.manaPerClick ?? manaPerClick;
      autoMana = savedData.autoMana ?? autoMana;
      prestigeLevel = savedData.prestigeLevel ?? prestigeLevel;
      prestigePrice = savedData.prestigePrice ?? prestigePrice;
      upgradeMPCPrice = savedData.upgradeMPCPrice ?? upgradeMPCPrice;
      upgradeAutoPrice = savedData.upgradeAutoPrice ?? upgradeAutoPrice;
      upgradeCrystalPrice = savedData.upgradeCrystalPrice ?? upgradeCrystalPrice;
      upgradeAutoSpeedPrice = savedData.upgradeAutoSpeedPrice ?? upgradeAutoSpeedPrice;
      upgradeExtraMoneyPrice = savedData.upgradeExtraMoneyPrice ?? upgradeExtraMoneyPrice;
      extraMoneyPerCrystal = savedData.extraMoneyPerCrystal ?? extraMoneyPerCrystal;
      autoInterval = savedData.autoInterval ?? autoInterval;

      // restore crystals
      crystalsContainer.innerHTML = '';
      crystals = [];
      if (Array.isArray(savedData.crystals) && savedData.crystals.length) {
        savedData.crystals.forEach(c => {
          createCrystal(parseInt(c.color, 10) || 0, parseInt(c.maxmana, 10) || 10, parseInt(c.money, 10) || 10);
          const last = crystals[crystals.length - 1];
          last.dataset.mana = c.mana ?? 0;
          updateFill(last);
        });
      }
    } catch (e) {
      console.warn('Load failed', e);
    }
  }

  // --- Start / Initialisierung ---
  loadGame();
  if (crystals.length === 0) {
    createCrystal(0, 10, 10); // initialer Kristall falls kein Save
  }
  updateUI();
  startAutoInterval();
});
