export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  language?: string;
}

export interface ProfileFormState {
  nickname: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
}
