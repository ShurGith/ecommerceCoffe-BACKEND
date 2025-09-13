declare module "@strapi/strapi" {
  export namespace factories {
    // Minimal typings to satisfy the editor/type checker
    function createCoreController(
      uid: string,
      cb?: (...args: any[]) => any
    ): any;
    function createCoreService(
      uid: string,
      cb?: (...args: any[]) => any
    ): any;
    function createCoreRouter(uid: string, config?: any): any;
  }
}