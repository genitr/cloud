import type { ReactNode, ButtonHTMLAttributes, SVGAttributes, ChangeEvent } from 'react';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onClick?: () => void;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export type IconName = 'home' | string;
export type IconFlip = 'horizontal' | 'vertical';

export interface IconProps extends SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  spin?: boolean;
  rotate?: number;
  flip?: IconFlip;
  title?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export interface IconBaseProps extends SVGAttributes<SVGElement> {
  size?: number;
  strokeColor?: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onClick?: () => void;
}

export type IconComponent = React.ForwardRefExoticComponent<IconBaseProps & React.RefAttributes<SVGSVGElement>>;

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';

export type FormFieldValue = string | number | boolean | readonly string[] | undefined;

export interface FormField {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule;
}

export interface ValidationRule {
  required?: boolean;
  validate?: (value: FormFieldValue, formData: Record<string, FormFieldValue>) => string | undefined;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormData {
  [key: string]: FormFieldValue;
}

export interface FormErrors {
  [key: string]: string;
}

export interface SubmitMessage {
  type: 'success' | 'error' | '';
  text: string;
}

export interface SubmitResult {
  message?: string;
  [key: string]: unknown;
}

export interface FormProps {
  fields: FormField[];
  initialData: FormData;
  validationRules: ValidationRules;
  onSubmit: (data: FormData) => Promise<SubmitResult | void>;
  submitButtonText?: string;
  title?: string;
  columns?: 1 | 2 | 3;
  alternateActionText?: string;
  onAlternateAction?: () => void;
  showAlternateAction?: boolean;
  serverError?: string | null;
}

export interface InputProps {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  value: FormFieldValue;
  errors: FormErrors;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isSubmitting: boolean;
  required?: boolean;
}

// ==================== API ====================
export const API_URL = 'http://localhost:8000/api';

// ==================== АУТЕНТИФИКАЦИЯ ====================
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginData extends FormData {
  login: string;
  password: string;
}

export interface RegistrationData extends FormData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string | null;
  storage_path?: string | null;
}

export interface UserDetail extends User {
  full_name: string;
  storage_url?: string | null;
  files_count: number;
  folders_count: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserDetail;
    token: string;
  };
}

export interface RegisterResponse {
  user: UserDetail;
  token: string;
  message: string;
}

export interface AuthResponse {
  user?: UserDetail;
  token?: string;
  message?: string;
  success?: boolean;
  data?: {
    user?: UserDetail;
    token?: string;
  };
}

export interface NavigationState {
  state?: {
    message?: string;
  };
}

export interface PermissionCheck {
  user_id: number;
  username: string;
  is_authenticated: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  permissions: {
    can_view_all_users: boolean;
    can_edit_users: boolean;
    can_delete_users: boolean;
    can_make_admin: boolean;
  };
}

// ==================== ПАПКИ ====================
export interface FolderInfo {
  id: number;
  name: string;
  full_path: string;
  storage_url?: string;
}

export interface Folder {
  id: number;
  name: string;
  parent_folder: number | null;
  parent_info: FolderInfo | null;
  owner: number;
  owner_info: {
    id: number;
    username: string;
    storage_path: string | null;
  } | null;
  subfolders_count: number;
  files_count: number;
  full_path: string;
  created_at: string;
  updated_at: string;
}

export interface FolderCreate {
  name: string;
  parent_folder?: number | null;
}

export interface FolderTree {
  id: number;
  name: string;
  full_path: string;
  subfolders: FolderTree[];
}

export interface FolderContents {
  folder: {
    id: number;
    name: string;
    full_path: string;
  };
  subfolders: Folder[];
  files: FileItem[]; // Изменено с File на FileItem
}

// ==================== ФАЙЛЫ ====================
export interface FileItem { // Переименовано с File на FileItem
  id: number;
  name: string;
  original_name: string;
  file: string;
  file_url: string | null;
  folder: number | null;
  folder_info: FolderInfo | null;
  owner: number;
  owner_info: {
    id: number;
    username: string;
    email: string;
    storage_url: string | null;
  };
  size: number;
  size_formatted: string;
  content_type: string;
  comment?: string;
  logical_path: string;
  uploaded_at: string;
  updated_at: string;
}

export interface FileListItem {
  id: number;
  name: string;
  folder_name: string;
  size_formatted: string;
  content_type: string;
  uploaded_at: string;
}

export interface FileUploadData {
  file: File | Blob;
  name?: string;
  folder?: number | null;
  comment?: string;
}

export interface FileFilterParams {
  folder?: number | null;
  type?: string;
  search?: string;
}

// ==================== РАСШАРИВАНИЕ ====================
export interface FileSharing {
  id: number;
  file: number;
  file_info: {
    id: number;
    name: string;
    original_name: string;
    size: number;
    content_type: string;
    logical_path: string;
  };
  created_by: number;
  created_by_info: {
    id: number;
    username: string;
  };
  share_token: string;
  share_url: string;
  downloads_count: number;
  views_count: number;
  created_at: string;
  last_accessed: string | null;
}

export interface PublicFileShare {
  share_token: string;
  file_info: {
    name: string;
    original_name: string;
    size: number;
    content_type: string;
    comment?: string;
    uploaded_at: string;
  };
  created_by_username: string;
  created_at: string;
}

// ==================== ХРАНИЛИЩЕ ====================
export interface FileTypeStat {
  type: string;
  count: number;
  total_size: number;
  total_size_formatted: string;
}

export interface StorageInfo {
  user_id: number;
  username: string;
  storage_path: string;
  full_storage_path: string;
  storage_url: string | null;
  statistics: {
    total_files: number;
    total_folders: number;
    total_size: number;
    total_size_formatted: string;
    used_space: {
      bytes: number;
      human_readable: string;
    };
  };
  files_by_type: FileTypeStat[];
}

// ==================== СТАТИСТИКА ====================
export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  staff_users: number;
  new_users_last_30_days: number;
  registration_by_month: Array<{
    month: string;
    count: number;
  }>;
}

// ==================== СОСТОЯНИЯ REDUX ====================
export interface AuthState {
  user: UserDetail | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface FoldersState {
  folders: Folder[];
  currentFolder: Folder | null;
  folderTree: FolderTree[];
  folderContents: FolderContents | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

export interface FilesState {
  files: FileListItem[];
  currentFile: FileItem | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number | null;
  totalCount: number;
  filters: FileFilterParams;
}

export interface SharingState {
  shares: FileSharing[];
  currentShare: FileSharing | null;
  publicShare: PublicFileShare | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

export interface UsersState {
  users: User[];
  currentUser: UserDetail | null;
  userStats: UserStats | null;
  storageInfo: StorageInfo | null;
  permissions: PermissionCheck | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

export interface RootState {
  auth: AuthState;
  folders: FoldersState;
  files: FilesState;
  sharing: SharingState;
  users: UsersState;
}

// ==================== МОДАЛЬНЫЕ ОКНА ====================

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateFolderModalProps extends BaseModalProps {
  onCreate: (folderName: string) => void;
}

export interface DeleteConfirmModalProps extends BaseModalProps {
  onConfirm: () => void;
  itemName: string | undefined;
}

export type Permission = 'view' | 'edit' | 'comment';

export interface ShareData {
  email: string;
  permission: Permission;
}

export interface ShareModalProps extends BaseModalProps {
  onShare: (shareData: ShareData) => void;
  itemName: string | undefined;
}

export interface UploadFileData {
  file: File;
  name?: string;
  comment?: string;
}

export interface UploadFileModalProps extends BaseModalProps {
  onUpload: (files: UploadFileData[] | null) => void;
}

export type ModalType = 'upload' | 'createFolder' | 'delete' | 'share';

export interface ModalsState {
  upload: boolean;
  createFolder: boolean;
  delete: boolean;
  share: boolean;
}