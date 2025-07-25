import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isBackupDueToday } from '../src/backupFilter.js';

describe('isBackupDueToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Tests pour la logique AM/PM ---
  it('should return true for AM backup if current time is AM and AM is 1', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // 10 AM UTC
    const item = { AM: 1, PM: 0, JourSauvegarde: 'TOUS_LES_JOURS' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return false for AM backup if current time is PM and AM is 1', () => {
    vi.setSystemTime(new Date('2025-07-25T14:00:00Z')); // 2 PM UTC
    const item = { AM: 1, PM: 0, JourSauvegarde: 'TOUS_LES_JOURS' };
    expect(isBackupDueToday(item)).toBe(false);
  });

  it('should return true for PM backup if current time is PM and PM is 1', () => {
    vi.setSystemTime(new Date('2025-07-25T14:00:00Z')); // 2 PM UTC
    const item = { AM: 0, PM: 1, JourSauvegarde: 'TOUS_LES_JOURS' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return false for PM backup if current time is AM and PM is 1', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // 10 AM UTC
    const item = { AM: 0, PM: 1, JourSauvegarde: 'TOUS_LES_JOURS' };
    expect(isBackupDueToday(item)).toBe(false);
  });

  it('should return false if both AM and PM are 0', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // 10 AM UTC
    const item = { AM: 0, PM: 0, JourSauvegarde: 'TOUS_LES_JOURS' };
    expect(isBackupDueToday(item)).toBe(false);
  });

  // --- Tests pour la logique JourSauvegarde ---
  it('should return true for TOUS_LES_JOURS on any day', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // Vendredi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'TOUS_LES_JOURS' };
    expect(isBackupDueToday(item)).toBe(true);

    vi.setSystemTime(new Date('2025-07-26T10:00:00Z')); // Samedi
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return true for TOUS_LES_JOURS_SAUF_WE on a weekday', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // Vendredi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'TOUS_LES_JOURS_SAUF_WE' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return false for TOUS_LES_JOURS_SAUF_WE on a weekend', () => {
    vi.setSystemTime(new Date('2025-07-26T10:00:00Z')); // Samedi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'TOUS_LES_JOURS_SAUF_WE' };
    expect(isBackupDueToday(item)).toBe(false);

    vi.setSystemTime(new Date('2025-07-27T10:00:00Z')); // Dimanche
    expect(isBackupDueToday(item)).toBe(false);
  });

  it('should return true for LUNDI on a Monday', () => {
    vi.setSystemTime(new Date('2025-07-28T10:00:00Z')); // Lundi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'LUNDI' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return false for LUNDI on a Tuesday', () => {
    vi.setSystemTime(new Date('2025-07-29T10:00:00Z')); // Mardi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'LUNDI' };
    expect(isBackupDueToday(item)).toBe(false);
  });

  // Ajoutez des tests similaires pour MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE
  it('should return true for MARDI on a Tuesday', () => {
    vi.setSystemTime(new Date('2025-07-29T10:00:00Z')); // Mardi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'MARDI' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return true for MERCREDI on a Wednesday', () => {
    vi.setSystemTime(new Date('2025-07-30T10:00:00Z')); // Mercredi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'MERCREDI' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return true for JEUDI on a Thursday', () => {
    vi.setSystemTime(new Date('2025-07-31T10:00:00Z')); // Jeudi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'JEUDI' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return true for VENDREDI on a Friday', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // Vendredi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'VENDREDI' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return true for SAMEDI on a Saturday', () => {
    vi.setSystemTime(new Date('2025-07-26T10:00:00Z')); // Samedi
    const item = { AM: 1, PM: 0, JourSauvegarde: 'SAMEDI' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return true for DIMANCHE on a Sunday', () => {
    vi.setSystemTime(new Date('2025-07-27T10:00:00Z')); // Dimanche
    const item = { AM: 1, PM: 0, JourSauvegarde: 'DIMANCHE' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  // --- Tests combinés JourSauvegarde et AM/PM ---
  it('should return true if day and AM/PM conditions are met', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // Vendredi 10 AM UTC
    const item = { AM: 1, PM: 0, JourSauvegarde: 'VENDREDI' };
    expect(isBackupDueToday(item)).toBe(true);
  });

  it('should return false if day condition is not met', () => {
    vi.setSystemTime(new Date('2025-07-25T10:00:00Z')); // Vendredi 10 AM UTC
    const item = { AM: 1, PM: 0, JourSauvegarde: 'LUNDI' };
    expect(isBackupDueToday(item)).toBe(false);
  });

  it('should return false if AM/PM condition is not met', () => {
    vi.setSystemTime(new Date('2025-07-25T14:00:00Z')); // Vendredi 2 PM UTC
    const item = { AM: 1, PM: 0, JourSauvegarde: 'VENDREDI' };
    expect(isBackupDueToday(item)).toBe(false);
  });
});
