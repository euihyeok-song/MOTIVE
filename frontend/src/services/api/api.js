import AlarmApiService from './AlarmApiService';
import AuthApiService from './AuthApiService';
import CareerApiService from './CareerApiService';
import CenterApiService from './CenterApiService';
import CertificationApiService from './CertificationApiService';
import ContractApiService from './ContractApiService';
import CustomerApiService from './CustomerApiService';
import EducationApiService from './EducationApiService';
import EvaluationApiService from './EvaluationApiService';
import FamilyApiService from './FamilyApiService';
import LogApiService from './LogApiService';
import MemberApiService from './MemberApiService'
import NoticeApiService from './NoticeApiService';
import OrderApiService from './OrderApiService';
import OrganizationApiService from './OrganizationApiService';
import ProblemApiService from './ProblemApiService';
import ProductApiService from './ProductApiService';
import PromotionApiService from './PromotionApiService';
import PurchaseOrderApiService from './PurchaseOrderApiService';
import SalesHistoryApiService from './SalesHistoryApiService';
import SampleApiService from './SampleApiService';
import ScheduleApiService from './ScheduleApiService';
import FileApiService from './FileApiService';
import NewsApiService from './NewsApiService';
import DashBoardService from './DashBoardApiService';

export const $api = {
    alarm: new AlarmApiService(),
    auth: new AuthApiService(),
    career: new CareerApiService(),
    center: new CenterApiService(),
    certification: new CertificationApiService(),
    contract: new ContractApiService(),
    customer: new CustomerApiService(),
    education: new EducationApiService(),
    evaluation: new EvaluationApiService(),
    family: new FamilyApiService(),
    log: new LogApiService(),
    member: new MemberApiService(),
    news: new NewsApiService(),
    notice: new NoticeApiService(),
    order: new OrderApiService(),
    organization: new OrganizationApiService(),
    problem: new ProblemApiService(),
    product: new ProductApiService(),
    promotion: new PromotionApiService(),
    purchaseOrder: new PurchaseOrderApiService(),
    salesHistory: new SalesHistoryApiService(),
    sample: new SampleApiService(),
    schedule: new ScheduleApiService(),
    file: new FileApiService(),
    dashBoard: new DashBoardService()
};