/**
 * Tournament Slot Management Utility
 * 
 * Logic for calculating total match slots, tracking occupied slots,
 * and randomly assigning available slot numbers to players/squads.
 * 
 * Rules:
 * - Solo Battle Royale: 48 players -> slots 1 to 48 (1 per player)
 * - Squad Battle Royale: 12 squads -> slots 1 to 12 (1 per squad, 48 players total)
 * - Duo Battle Royale: 24 duos -> slots 1 to 24 (1 per duo, 48 players total)
 * - Clash Squad (4v4): 2 slots (Slot 1 vs Slot 2) or 4 slots (or custom maxSlots)
 * - Lone Wolf / 1v1: 2 slots (Slot 1 vs Slot 2) or custom bracket
 */

/**
 * Get total slot capacity for a tournament based on its mode and configured maxSlots.
 * @param {Object} tournament 
 * @returns {number} Total slots available (e.g. 48, 12, 2, 4, 24)
 */
export const getTournamentTotalSlots = (tournament) => {
  if (!tournament) return 12;

  const modeLower = (tournament.mode || '').toLowerCase();
  const isSolo = modeLower.includes('solo') || modeLower.includes('1v1');
  const isDuo = modeLower.includes('duo') || modeLower.includes('2v2');
  const isSquad = modeLower.includes('squad') || modeLower.includes('4v4') || 
                  (modeLower.includes('cs') && !modeLower.includes('solo'));
  const isCS = modeLower.includes('cs') || modeLower.includes('clash');
  const isBR = modeLower.includes('br') || modeLower.includes('battle royale');

  const configuredMax = Number(tournament.maxSlots) || Number(tournament.totalSlots);

  // If configuredMax is explicitly set:
  if (configuredMax && configuredMax > 0) {
    // If Squad BR and admin entered 48 (treating 48 as player count),
    // in Free Fire BR squad rooms there are 12 squad slots (48 / 4 = 12).
    if (isBR && isSquad && configuredMax === 48) {
      return 12;
    }
    return configuredMax;
  }

  // Mode-based esports defaults:
  if (isCS) {
    // Clash squad standard room is 2 teams or 4 teams
    return 2;
  }
  if (isBR) {
    if (isSquad) return 12; // 12 Squad slots
    if (isDuo) return 24;   // 24 Duo slots
    return 48;              // 48 Solo player slots
  }

  if (isSolo) return 48;
  if (isDuo) return 24;
  if (isSquad) return 12;

  return 12;
};

/**
 * Returns a Set of currently occupied slot numbers for a tournament.
 * @param {Array} participants 
 * @returns {Set<number>} Set of occupied numbers
 */
export const getOccupiedSlotNumbers = (participants = []) => {
  const occupied = new Set();
  if (!Array.isArray(participants)) return occupied;

  participants.forEach(p => {
    const slot = Number(p.slotNumber || p.slot);
    if (!isNaN(slot) && slot > 0) {
      occupied.add(slot);
    }
  });

  return occupied;
};

/**
 * Returns an array of available (unoccupied) slot numbers [1..totalSlots].
 * @param {Object} tournament 
 * @returns {number[]} Array of available numbers, e.g. [1, 2, 4, 7, 9]
 */
export const getAvailableSlots = (tournament) => {
  if (!tournament) return [];
  const totalSlots = getTournamentTotalSlots(tournament);
  const occupied = getOccupiedSlotNumbers(tournament.participants);

  const available = [];
  for (let s = 1; s <= totalSlots; s++) {
    if (!occupied.has(s)) {
      available.push(s);
    }
  }

  return available;
};

/**
 * Randomly picks an available slot from the tournament.
 * Guarantees that occupied slots are NEVER reassigned.
 * 
 * @param {Object} tournament
 * @param {number|null} preferredSlot (optional)
 * @returns {number|null} Assigned slot number (1..totalSlots) or null if full
 */
export const assignRandomSlot = (tournament, preferredSlot = null) => {
  const available = getAvailableSlots(tournament);
  
  if (available.length === 0) {
    return null; // Tournament is 100% full
  }

  // If a valid preferred slot was passed and is available, use it
  if (preferredSlot && available.includes(Number(preferredSlot))) {
    return Number(preferredSlot);
  }

  // Pick a random available slot
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

/**
 * Checks if tournament is full
 * @param {Object} tournament 
 * @returns {boolean}
 */
export const isTournamentFull = (tournament) => {
  if (!tournament) return false;
  const available = getAvailableSlots(tournament);
  return available.length === 0;
};
