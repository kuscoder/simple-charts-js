import type { ISimpleGraphsJSOptions } from './simple-graphs-js.types';
declare class SimpleGraphsJS {
    private static presetOptions;
    private static validateOptions;
    private static getOptions;
    /**
     * Updates the preset options with the provided options.
     *
     * @param {Partial<ISimpleGraphsJSOptions>} options - The options to update the preset options with. Default is an empty object.
     */
    static changePresetOptions(options?: Partial<ISimpleGraphsJSOptions>): void;
    private readonly WIDTH;
    private readonly HEIGHT;
    private readonly PADDING;
    private readonly ROWS_COUNT;
    private readonly MONTHS_NAMES;
    private readonly DATES;
    private readonly COLUMNS;
    private readonly STYLES;
    private readonly DPI_WIDTH;
    private readonly DPI_HEIGHT;
    private readonly VIEW_WIDTH;
    private readonly VIEW_HEIGHT;
    private readonly BOUNDARIES;
    private readonly X_RATIO;
    private readonly Y_RATIO;
    private readonly ROWS_STEP;
    private readonly TEXT_STEP;
    private readonly DATE_COUNT;
    private readonly DATE_STEP;
    private readonly container;
    private readonly canvas;
    private readonly ctx;
    constructor(container: HTMLElement, options?: Partial<ISimpleGraphsJSOptions>);
    initialize(): void;
    destroy(): void;
    private draw;
    private drawAxisX;
    private drawAxisY;
    private drawLines;
    private getColumns;
    private getBoundaries;
    private getDate;
    private getX;
    private getY;
}
export default SimpleGraphsJS;
