import type { IChartOptions, DeepPartial } from './chart-types';
export declare class Chart {
    private static presetOptions;
    private readonly WIDTH;
    private readonly HEIGHT;
    private readonly PADDING;
    private readonly ROWS_COUNT;
    private readonly DATA;
    private readonly I18N;
    private readonly INTERACTIVITY;
    private readonly STYLE;
    private readonly TECHNICAL;
    private readonly DPI_WIDTH;
    private readonly DPI_HEIGHT;
    private readonly VIEW_WIDTH;
    private readonly VIEW_HEIGHT;
    private readonly LINES_VERTICES_BOUNDARIES;
    private readonly X_RATIO;
    private readonly Y_RATIO;
    private readonly ROWS_STEP;
    private readonly TEXT_STEP;
    private readonly TIMELINE_ITEMS_COUNT;
    private readonly TIMELINE_ITEMS_STEP;
    private readonly mouse;
    private rafID;
    private isInitialized;
    private containerElement;
    private wrapperElement;
    private canvasElement;
    private tooltipElement;
    private canvasRect;
    private ctx;
    /**
     * Constructor for creating a new instance of the Chart class.
     *
     * @param {HTMLElement} containerElement - the HTML element that will contain the chart
     * @param {DeepPartial<IChartOptions>} options - optional chart options
     */
    constructor(containerElement: HTMLElement, options?: DeepPartial<IChartOptions>);
    /**
     * Initializes the component by appending the canvas to the container element and drawing the chart.
     *
     * @return {boolean} Returns true if the chart is successfully initialized, false otherwise.
     */
    initialize(): boolean;
    /**
     * Destroys the instance and cleans up all resources.
     *
     * @return {boolean} Returns true if the chart is successfully destroyed, false otherwise.
     */
    destroy(): boolean;
    /** Create the necessary DOM elements for the chart, but does not insert into the DOM. */
    private createDOMElements;
    /** Main method that draws the chart by clearing the canvas. */
    private drawChart;
    /** Draws the background of the chart. */
    private drawBackground;
    /** Draws the timeline of the chart and guide lines. */
    private drawTimeline;
    /**
     * Draws the guide lines if the mouse-x is over the vertice
     *
     * @param {number} x - The x-coordinate to check for mouse position and draw the guide lines.
     * @param {number} i - The original index of the vertice
     * @param {string} text - The title to display in the tooltip
     * @return {boolean} true if the guide lines were drawn, false otherwise
     */
    private drawGuideLinesIsOver;
    /** Draws the rows of the chart. */
    private drawRows;
    /** Draws the lines of the chart. */
    private drawLines;
    /**
     * Generates the tooltip content and displays it at the specified position.
     *
     * @param {string} title - The title of the tooltip.
     * @param {ITooltipItem[]} items - An array of tooltip items.
     * @return {boolean} Returns true if the tooltip was successfully displayed, false otherwise.
     */
    private tooltipShow;
    private getTooltipCoordinatesByPosition;
    /**
     * Hides the tooltip.
     *
     * @return {boolean} Returns true if the tooltip was successfully hidden, false otherwise.
     */
    private tooltipHide;
    /** Event handler that updates the mouse position by canvas coordinates. */
    private mouseMoveHandler;
    /** Event handler that resets the mouse position when the mouse leaves the canvas. */
    private mouseLeaveHandler;
    /** Event handler that update the chart interactivity when the window is resized. */
    private resizeHandler;
    /**
     * Returns an array containing the minimum and maximum y vertices values in the given lines array.
     *
     * @param {ILine[]} lines - an array of lines
     * @return {[number, number]} an array containing the minimum and maximum y values
     */
    private getLinesVerticesBoundaries;
    /**
     * Returns a formatted date string for timeline based on the given timestamp.
     *
     * @param {number} timestamp - The timestamp to convert to a date.
     * @return {string} The formatted date string in the format "day month".
     */
    private getDate;
    /**
     * Calculates the x-coordinate value based on the given input value.
     *
     * @param {number} value - The input value used to calculate the x-coordinate.
     * @return {number} The calculated x-coordinate value.
     */
    private getX;
    /**
     * Calculates the y-coordinate value based on the given input value.
     *
     * @param {number} value - The input value used to calculate the y-coordinate.
     * @return {number} The calculated y-coordinate value.
     */
    private getY;
    /**
     * Calculate the maximum length of the lines vertices values.
     *
     * @param {?ILine[]} lines - optional parameter for the lines
     * @return {number} the maximum length of the lines vertices values.
     */
    private getLinesVerticesLongestLength;
    /**
     * Checks if the mouse-x is hovering over an vertice at its x-coordinate.
     *
     * @param {number} x - The vertice coordinate to check.
     * @return {boolean} true if the mouse-x is hovering over the vertice, false otherwise.
     */
    private isMouseVerticeOver;
    /**
     * Logs a debug message
     *
     * @param {string} scope - the scope of the debug message
     * @param {string} message - the message to be logged
     */
    private debugLog;
    /**
     * Validates the provided options for a chart constructor.
     *
     * @param {DeepPartial<IChartOptions>} options - the options to be validated
     * @throws {ChartOptionsError} if the options are invalid
     * @return {void}
     */
    private static validateOptions;
    /**
     * Returns the formatted options for the chart constructor by merging the provided options with the preset options.
     *
     * @param {DeepPartial<IChartOptions>} options - The options to merge with the preset options.
     * @return {IChartOptions} The merged options.
     */
    private static getOptions;
    /**
     * Updates the preset options with the provided options.
     *
     * @param {DeepPartial<IChartOptions>} options - The options to update the preset options with. Default is an empty object.
     */
    static changePresetOptions(options?: DeepPartial<IChartOptions>): void;
}
