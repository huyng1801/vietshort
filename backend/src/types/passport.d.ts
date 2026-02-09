declare module 'passport-facebook' {
  export interface Profile {
    id: string;
    displayName?: string;
    name?: {
      familyName?: string;
      givenName?: string;
    };
    emails?: Array<{ value: string }>;
    photos?: Array<{ value: string }>;
    provider?: string;
    _raw?: string;
    _json?: any;
  }

  export class Strategy {
    constructor(options: any, verify: any);
    name: string;
    authenticate: any;
  }
}

declare module 'passport-apple' {
  export class Strategy {
    constructor(options: any, verify: any);
    name: string;
    authenticate: any;
  }
}
