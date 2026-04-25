import { 
  Logo, AdminPanelSettings, AccountCircle, LogIn, LogOut, Register,
  ArrowDropUp, ArrowDropDown, ArrowLeft, ArrowRight, Warning, ButtonOk,
  FileSize
} from './System';
import {
  FileUpload, FileShare, FileEdit, FileDownload, FileDelete, Eye, Pencil, 
  FileComment, FileLink, LinkCopy, LinkCopied, NewFile, NewFolder
 } from './FileActions';
import { 
  FileFolder, FileImage, FileAudio, FileText, FileZip, FilePdf, FileVideo, FileBase, FileDoc
} from './FileTypes';
import { 
  LockUser, UnlockUser, UserFolder, AdminUser , Crown, UserDelete,
  AllUsers, BlockedUser, ActiveUser, CalendarMonth, MakeAdmin,
  AccessTime
} from './AdminPanel';


const iconMap = {
  logo: Logo,
  admin: AdminPanelSettings,
  user: AccountCircle,
  logout: LogOut,
  login: LogIn,
  register: Register,
  arrowUp: ArrowDropUp,
  arrowDown: ArrowDropDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  warning: Warning,
  uploadFile: FileUpload,
  share: FileShare,
  edit: FileEdit,
  download: FileDownload,
  delete: FileDelete,
  folder: FileFolder,
  audioFile: FileAudio,
  imageFile: FileImage,
  textFile: FileText,
  zipFile: FileZip,
  pdfFile: FilePdf,
  docFile: FileDoc,
  videoFile: FileVideo,
  file: FileBase,
  eye: Eye,
  pencil: Pencil,
  comment: FileComment,
  link: FileLink,
  linkCopy: LinkCopy,
  linkCopied: LinkCopied,
  lock: LockUser,
  unlock: UnlockUser,
  userFiles: UserFolder,
  crown: Crown,
  userDelete: UserDelete,
  makeAdmin: MakeAdmin,
  adminUser: AdminUser,
  allUsers: AllUsers,
  accessTime: AccessTime,
  calendar: CalendarMonth,
  blockedUser: BlockedUser,
  activeUser: ActiveUser,
  database: Logo,
  ok: ButtonOk,
  newFile: NewFile,
  newFolder: NewFolder,
  fileSize: FileSize
};

export default iconMap;