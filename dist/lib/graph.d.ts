import type { IGraphOptions } from './types';
export declare class Graph {
    private static presetOptions;
    private static validateOptions;
    private static getOptions;
    /**
     * Updates the preset options with the provided options.
     *
     * @param {Partial<IGraphOptions>} options - The options to update the preset options with. Default is an empty object.
     */
    static changePresetOptions(options?: Partial<IGraphOptions>): void;
    private readonly WIDTH;
    private readonly HEIGHT;
    private readonly PADDING;
    private readonly ROWS_COUNT;
    private readonly MONTHS_NAMES;
    private readonly X_AXIS_DATA;
    private readonly Y_AXIS_DATA;
    private readonly STYLES;
    private readonly DPI_WIDTH;
    private readonly DPI_HEIGHT;
    private readonly VIEW_WIDTH;
    private readonly VIEW_HEIGHT;
    private readonly Y_BOUNDARIES;
    private readonly X_RATIO;
    private readonly Y_RATIO;
    private readonly ROWS_STEP;
    private readonly TEXT_STEP;
    private readonly X_AXIS_DATA_COUNT;
    private readonly X_AXIS_DATA_STEP;
    private readonly container;
    private readonly canvas;
    private readonly ctx;
    constructor(container: HTMLElement, options?: Partial<IGraphOptions>);
    initialize(): void;
    destroy(): void;
    private draw;
    private drawAxisX;
    private drawAxisY;
    private drawLines;
    private getBoundariesY;
    private getDate;
    private getX;
    private getY;
}
