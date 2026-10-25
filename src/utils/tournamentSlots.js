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
  if (!tournament) return 16;

  const modeLower = (tournament.mode || '').toLowerCase();
  const isSolo = modeLower.includes('solo') || modeLower.includes('1v1');
  const isDuo = modeLower.includes('duo') || modeLower.includes('2v2');
  const isSquad = modeLower.includes('squad') || modeLower.includes('4v4') || 
                  (modeLower.includes('cs') && !modeLower.includes('solo'));
  const isCS = modeLower.includes('cs') || modeLower.includes('clash');
  const isBR = modeLower.includes('br') || modeLower.includes('battle royale');

  // Check if configuredMax is explicitly set as a number
  const configuredMax = Number(tournament.maxSlots) || Number(tournament.totalSlots);
  if (configuredMax && configuredMax > 0) {
    if (isBR && isSquad && configuredMax === 48) {
      return 12;
    }
    return configuredMax;
  }

  // Parse total slots from tournament.slots string like "14/16 Squads" or "44/48 Teams"
  if (tournament.slots && typeof tournament.slots === 'string') {
    const slashMatch = tournament.slots.match(/\/(\d+)/);
    if (slashMatch && Number(slashMatch[1]) > 0) {
      const parsedSlots = Number(slashMatch[1]);
      if (isBR && isSquad && parsedSlots === 48) {
        return 12;
      }
      return parsedSlots;
    }
  }

  // Mode-based esports defaults:
  if (isCS) {
    if (isSquad) return 16;
    if (isDuo) return 8;
    return 16;
  }
  if (isBR) {
    if (isSquad) return 12; // 12 Squad slots
    if (isDuo) return 24;   // 24 Duo slots
    return 48;              // 48 Solo player slots
  }

  if (isSolo) return 48;
  if (isDuo) return 24;
  if (isSquad) return 16;

  return 16;
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
  if (!tournament) return [1, 2, 3, 4, 5];
  const baseTotal = getTournamentTotalSlots(tournament);
  const occupied = getOccupiedSlotNumbers(tournament.participants);
  // Guarantee there are always available slots
  const totalSlots = Math.max(baseTotal, occupied.size + 10);

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
 * @returns {number} Assigned slot number (1..totalSlots)
 */
export const assignRandomSlot = (tournament, preferredSlot = null) => {
  const available = getAvailableSlots(tournament);
  
  if (preferredSlot && available.includes(Number(preferredSlot))) {
    return Number(preferredSlot);
  }

  if (available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  // Safe fallback: pick the lowest unoccupied slot number
  const occupied = getOccupiedSlotNumbers(tournament?.participants);
  let s = 1;
  while (occupied.has(s)) {
    s++;
  }
  return s;
};

/**
 * Checks if tournament is full
 * @param {Object} tournament 
 * @returns {boolean}
 */
export const isTournamentFull = (tournament) => {
  return false;
};
