import { Card, CardMovement } from '../types/card';
import { Column } from '../types/column';
import { TimeBreakdown } from '../types/board';

export class TimeTracker {
  /**
   * Calculate time spent in a specific column
   */
  static getTimeInColumn(card: Card, columnId: string): number {
    if (card.movementHistory.length === 0) return 0;

    let totalTime = 0;
    let entryTime: Date | null = null;

    // Sort movements by timestamp
    const movements = [...card.movementHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const movement of movements) {
      // Card entered this column
      if (movement.toColumnId === columnId) {
        entryTime = new Date(movement.timestamp);
      }

      // Card left this column
      if (movement.fromColumnId === columnId && entryTime) {
        const exitTime = new Date(movement.timestamp);
        totalTime += exitTime.getTime() - entryTime.getTime();
        entryTime = null;
      }
    }

    // If card is currently in this column, add time until now
    if (card.columnId === columnId && entryTime) {
      totalTime += new Date().getTime() - entryTime.getTime();
    }

    return totalTime;
  }

  /**
   * Calculate total time from creation to completion
   */
  static getTotalTimeToCompletion(card: Card): number | null {
    const completionMovement = card.movementHistory.find(
      (m) => m.toColumnId === 'done'
    );

    if (!completionMovement) {
      // Not completed yet, return time since creation
      return new Date().getTime() - new Date(card.createdDate).getTime();
    }

    return (
      new Date(completionMovement.timestamp).getTime() -
      new Date(card.createdDate).getTime()
    );
  }

  /**
   * Get time breakdown by column
   */
  static getTimeBreakdown(card: Card, columns: Column[]): TimeBreakdown[] {
    const totalTime = this.getTotalTimeToCompletion(card) || 1;

    return columns.map((column) => {
      const timeSpent = this.getTimeInColumn(card, column.id);
      const percentage = (timeSpent / totalTime) * 100;

      return {
        columnName: column.name,
        columnId: column.id,
        timeSpent,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
  }

  /**
   * Format duration in human-readable format
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 0) return '0m';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0
        ? `${days}d ${remainingHours}h`
        : `${days}d`;
    }

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }

    if (minutes > 0) {
      return `${minutes}m`;
    }

    return `${seconds}s`;
  }

  /**
   * Get movement history in chronological order
   */
  static getMovementHistory(card: Card): CardMovement[] {
    return [...card.movementHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Calculate average time per column (across multiple cards)
   */
  static getAverageTimeInColumn(cards: Card[], columnId: string): number {
    const cardsWithTime = cards.filter((card) =>
      card.movementHistory.some((m) => m.toColumnId === columnId)
    );

    if (cardsWithTime.length === 0) return 0;

    const totalTime = cardsWithTime.reduce(
      (sum, card) => sum + this.getTimeInColumn(card, columnId),
      0
    );

    return totalTime / cardsWithTime.length;
  }

  /**
   * Get percentage of time in current column
   */
  static getCurrentColumnPercentage(card: Card): number {
    const totalTime = this.getTotalTimeToCompletion(card) || 1;
    const currentTime = this.getTimeInColumn(card, card.columnId);
    return Math.round((currentTime / totalTime) * 100);
  }
}
