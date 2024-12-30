class ApiResponse<T, K = undefined> {
  private success: boolean;

  constructor(
    public statusCode: number,
    public data: T,
    public message: string = "Successful",
    public meta?: K
  ) {
    this.success = statusCode < 400;
    this.message = statusCode >= 400 ? "Failed" : message || "Successful";
  }
  // format the response method
  public format(): Record<string, any> {
    return {
      success: this.success,
      message: this.message,
      meta: this.meta || {},
      data: this.data,
    };
  }
}
export default ApiResponse;

// Optional if meta might not be passed
// Determines if the request was successful
// Adjusts the message based on status code
