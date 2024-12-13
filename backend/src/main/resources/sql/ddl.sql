<<<<<<< HEAD
<<<<<<< HEAD
-- 자식 테이블부터 삭제
DROP TABLE IF EXISTS tb_product_option;
DROP TABLE IF EXISTS tb_update_history;
DROP TABLE IF EXISTS tb_member_detail;
DROP TABLE IF EXISTS tb_alarm;
DROP TABLE IF EXISTS tb_schedule;
DROP TABLE IF EXISTS tb_file;
DROP TABLE IF EXISTS tb_promotion;
DROP TABLE IF EXISTS tb_evaluation;
DROP TABLE IF EXISTS tb_purchase_order;
DROP TABLE IF EXISTS tb_problem;
DROP TABLE IF EXISTS tb_order;
DROP TABLE IF EXISTS tb_notice;
DROP TABLE IF EXISTS tb_contract;
DROP TABLE IF EXISTS tb_product;
DROP TABLE IF EXISTS tb_customer_info;
DROP TABLE IF EXISTS tb_member_role;
DROP TABLE IF EXISTS tb_member;
DROP TABLE IF EXISTS tb_center;
DROP TABLE IF EXISTS tb_organization_chart;
DROP TABLE IF EXISTS tb_sales_history;

-- 조직 관련 테이블 생성
CREATE TABLE tb_organization_chart
(
    ORG_CHA_ID    VARCHAR(255) NOT NULL,
    ORG_CHA_NAME  VARCHAR(255) NOT NULL,
    ORG_CHA_DEPTH INT          NOT NULL,
    PRIMARY KEY (ORG_CHA_ID)
);

CREATE TABLE tb_center
(
    CENT_ID      VARCHAR(255) NOT NULL,
    CENT_NAME    VARCHAR(255) NOT NULL,
    CENT_ADR     VARCHAR(255) NOT NULL,
    CENT_PHO     VARCHAR(255) NOT NULL,
    CENT_MEM_CNT INT          NOT NULL,
    CREATED_AT   CHAR(19)     NOT NULL,
    UPDATED_AT   CHAR(19)     NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    DELETED_AT   CHAR(19)     NULL,
    ACTIVE       BOOLEAN      NOT NULL,
    CENT_OPR_AT  VARCHAR(255) NOT NULL,
    PRIMARY KEY (CENT_ID)
);

CREATE TABLE tb_member
(
    MEM_ID        VARCHAR(255) NOT NULL,
    MEM_LOGN_ID   INT          NOT NULL,
    MEM_PWD       VARCHAR(255) NOT NULL,
    MEM_NAME      VARCHAR(255) NOT NULL,
    MEM_EMA       VARCHAR(255) NOT NULL,
    MEM_AGE       INT          NOT NULL,
    MEM_SEX       VARCHAR(255) NOT NULL DEFAULT 'FEMALE',
    MEM_IDEN_NO   VARCHAR(255) NOT NULL,
    MEM_PHO       VARCHAR(255) NOT NULL,
    MEM_EMER_PHO  VARCHAR(255) NULL,
    MEM_ADR       VARCHAR(255) NOT NULL,
    MEM_NOTE      VARCHAR(255) NULL,
    MEM_POS       VARCHAR(255) NOT NULL DEFAULT 'INTERN',
    MEM_GRD       VARCHAR(255) NOT NULL DEFAULT 'High School',
    MEM_JOB_TYPE  VARCHAR(255) NOT NULL,
    MEM_MIL       VARCHAR(255) NOT NULL DEFAULT 'exemption',
    MEM_BANK_NAME VARCHAR(255) NULL,
    MEM_ACC       VARCHAR(255) NULL,
    CREATED_AT    CHAR(19)     NOT NULL,
    UPDATED_AT    CHAR(19)     NOT NULL,
    DELETED_AT    CHAR(19)     NULL,
    ACTIVE        BOOLEAN      NOT NULL DEFAULT TRUE,
    CENTER_ID     VARCHAR(255) NOT NULL,
    ORG_CHA_ID    VARCHAR(255) NOT NULL,
    PRIMARY KEY (MEM_ID),
    FOREIGN KEY (CENTER_ID) REFERENCES tb_center (CENT_ID),
    FOREIGN KEY (ORG_CHA_ID) REFERENCES tb_organization_chart (ORG_CHA_ID)
);

CREATE TABLE tb_member_role
(
    MEM_ROL_ID   VARCHAR(255) NOT NULL,
    MEM_ROL_NAME VARCHAR(255) NOT NULL DEFAULT '영업 사원',
    MEM_ID       VARCHAR(255) NOT NULL,
    PRIMARY KEY (MEM_ROL_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_customer_info
(
    CUST_ID       VARCHAR(255) NOT NULL,
    CUST_NAME     VARCHAR(255) NOT NULL,
    CUST_AGE      INT          NOT NULL,
    CUST_SEX      VARCHAR(255) NOT NULL DEFAULT 'FEMALE',
    CUST_PHO      VARCHAR(255) NOT NULL,
    CUST_EMER_PHO VARCHAR(255) NOT NULL,
    CUST_EMA      VARCHAR(255) NOT NULL,
    ACTIVE        BOOLEAN      NOT NULL DEFAULT TRUE,
    MEM_ID        VARCHAR(255) NOT NULL,
    PRIMARY KEY (CUST_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

-- 부모 테이블 생성
CREATE TABLE tb_product
(
    PROD_ID     VARCHAR(255) NOT NULL,
    PROD_SER_NO VARCHAR(255) NOT NULL,
    PROD_COST   INT          NOT NULL,
    PROD_NAME   VARCHAR(255) NOT NULL,
    PROD_STCK   INT          NOT NULL DEFAULT 0,
    CREATED_AT  CHAR(19)     NOT NULL,
    UPDATED_AT  CHAR(19)     NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    DELETED_AT  CHAR(19)     NULL,
    ACTIVE      BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (PROD_ID, PROD_SER_NO)
);

CREATE TABLE tb_contract
(
    CONR_ID            VARCHAR(255) NOT NULL,
    CONR_NAME          VARCHAR(255) NOT NULL,
    CONR_CUST_NAME     VARCHAR(255) NOT NULL,
    CONR_CUST_IDEN_NO  VARCHAR(255) NOT NULL,
    CONR_CUST_ADR      VARCHAR(255) NOT NULL,
    CONR_CUST_EMA      VARCHAR(255) NOT NULL,
    CONR_CUST_PHO      VARCHAR(255) NOT NULL,
    CONR_COMP_NAME     VARCHAR(255) NULL,
    CONR_CUST_CLA      VARCHAR(255) NOT NULL DEFAULT 'PERSONAL',
    CONR_CUST_PUR_COND VARCHAR(255) NOT NULL DEFAULT 'CASH',
    CONR_SERI_NUM      VARCHAR(255) NOT NULL,
    CONR_NO_OF_VEH     INT          NOT NULL DEFAULT 1,
    ACTIVE             BOOLEAN      NOT NULL DEFAULT TRUE,
    CREATED_AT         CHAR(19)     NOT NULL,
    UPDATED_AT         CHAR(19)     NOT NULL,
    MEM_ID             VARCHAR(255) NOT NULL,
    CENT_ID            VARCHAR(255) NOT NULL,
    CUST_ID2           VARCHAR(255) NOT NULL,
    PROD_ID            VARCHAR(255) NOT NULL,
    PRIMARY KEY (CONR_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID) ON DELETE CASCADE,
    FOREIGN KEY (CUST_ID2) REFERENCES tb_customer_info (CUST_ID) ON DELETE CASCADE,
    FOREIGN KEY (PROD_ID) REFERENCES tb_product (PROD_ID) ON DELETE CASCADE,
    FOREIGN KEY (CENT_ID) REFERENCES tb_center (CENT_ID) ON DELETE CASCADE
);

CREATE TABLE tb_notice
(
    NOT_ID     VARCHAR(255) NOT NULL,
    NOT_TTL    VARCHAR(255) NOT NULL,
    NOT_TAG    VARCHAR(255) NOT NULL DEFAULT 'ALL',
    NOT_CLA    VARCHAR(255) NOT NULL DEFAULT 'NORMAL',
    NOT_CONT   TEXT         NOT NULL,
    CREATED_AT CHAR(19)     NOT NULL,
    UPDATED_AT CHAR(19)     NOT NULL,
    DELETED_AT CHAR(19)     NULL,
    ACTIVE     BOOLEAN      NOT NULL DEFAULT TRUE,
    MEM_ID     VARCHAR(255) NOT NULL,
    PRIMARY KEY (NOT_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_order
(
    ORD_ID     VARCHAR(255) NOT NULL,
    ORD_TTL    VARCHAR(255) NOT NULL,
    ACTIVE     BOOLEAN      NOT NULL DEFAULT TRUE,
    CREATED_AT CHAR(19)     NOT NULL,
    UPDATED_AT CHAR(19)     NOT NULL,
    DELETED_AT CHAR(19)     NULL,
    ORD_STAT   VARCHAR(255) NOT NULL DEFAULT 'WAIT',
    CONR_ID    VARCHAR(255) NOT NULL,
    MEM_ID     VARCHAR(255) NOT NULL,
    MEM_ID2    VARCHAR(255) NOT NULL,
    PRIMARY KEY (ORD_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID) ON DELETE CASCADE,
    FOREIGN KEY (MEM_ID2) REFERENCES tb_member (MEM_ID) ON DELETE CASCADE,
    FOREIGN KEY (CONR_ID) REFERENCES tb_contract (CONR_ID) ON DELETE CASCADE
);

CREATE TABLE tb_PROBLEM
(
    PROB_ID    VARCHAR(255) NOT NULL,
    PROB_TTL   VARCHAR(255) NOT NULL,
    PROB_CONT  VARCHAR(255) NOT NULL,
    CREATED_AT CHAR(19)     NOT NULL,
    UPDATED_AT CHAR(19)     NOT NULL,
    ACTIVE     BOOLEAN      NOT NULL DEFAULT TRUE,
    DELETED_AT CHAR(19)     NULL,
    CUST_ID    VARCHAR(255) NOT NULL,
    MEM_ID     VARCHAR(255) NOT NULL,
    PROD_ID    VARCHAR(255) NOT NULL,
    PRIMARY KEY (PROB_ID),
    FOREIGN KEY (CUST_ID) REFERENCES tb_customer_info (CUST_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID),
    FOREIGN KEY (PROD_ID) REFERENCES tb_product (PROD_ID)
);

CREATE TABLE tb_purchase_order
(
    PUR_ORD_ID   VARCHAR(255) NOT NULL,
    PUR_ORD_TTL  VARCHAR(255) NOT NULL,
    PUR_CONT     TEXT         NOT NULL,
    CREATED_AT   CHAR(19)     NOT NULL,
    UPDATED_AT   CHAR(19)     NOT NULL,
    DELETED_AT   CHAR(19)     NULL,
    ACTIVE       BOOLEAN      NOT NULL DEFAULT TRUE,
    PUR_ORD_STAT VARCHAR(255) NOT NULL DEFAULT 'WAIT',
    ORD_ID       VARCHAR(255) NOT NULL,
    MEM_ID       VARCHAR(255) NOT NULL,
    PRIMARY KEY (PUR_ORD_ID),
    FOREIGN KEY (ORD_ID) REFERENCES tb_order (ORD_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_EVALUATION
(
    EVAL_ID    VARCHAR(255) NOT NULL,
    EVAL_TTL   VARCHAR(255) NOT NULL,
    EVAL_CONT  VARCHAR(255) NOT NULL,
    CREATED_AT CHAR(19)     NOT NULL,
    UPDATED_AT CHAR(19)     NOT NULL,
    DELETED_AT CHAR(19)     NULL,
    ACTIVE     BOOLEAN      NOT NULL DEFAULT TRUE,
    CENT_ID    VARCHAR(255) NOT NULL,
    MEM_ID     VARCHAR(255) NOT NULL,
    PRIMARY KEY (EVAL_ID),
    FOREIGN KEY (CENT_ID) REFERENCES tb_center (CENT_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_promotion
(
    PROM_ID    VARCHAR(255) NOT NULL,
    PROM_TTL   VARCHAR(255) NOT NULL,
    PROM_CONT  VARCHAR(255) NOT NULL,
    CREATED_AT CHAR(19)     NOT NULL,
    UPDATED_AT CHAR(19)     NOT NULL,
    DELETED_AT CHAR(19)     NULL,
    ACTIVE     BOOLEAN      NOT NULL DEFAULT TRUE,
    MEM_ID     VARCHAR(255) NOT NULL,
    PRIMARY KEY (PROM_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_file
(
    FILE_ID    VARCHAR(255) NOT NULL,
    FILE_NAME  VARCHAR(255) NOT NULL,
    FILE_URL   VARCHAR(255) NOT NULL,
    FILE_TYPE  VARCHAR(255) NOT NULL,
    ACTIVE     BOOLEAN      NOT NULL DEFAULT TRUE,
    CREATED_AT CHAR(19)     NOT NULL,
    DELETED_AT CHAR(19)     NULL,
    MEM_ID     VARCHAR(255) NOT NULL,
    PRIMARY KEY (FILE_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_schedule
(
    SCH_ID     VARCHAR(255) NOT NULL,
    SCH_NAME   VARCHAR(255) NOT NULL,
    SCH_CONT   VARCHAR(255) NOT NULL,
    SCH_RES    CHAR(19)     NOT NULL,
    CREATED_AT CHAR(19)     NOT NULL,
    UPDATED_AT CHAR(19)     NOT NULL,
    DELETED_AT CHAR(19)     NULL,
    ACTIVE     BOOLEAN      NOT NULL DEFAULT TRUE,
    MEM_ID     VARCHAR(255) NOT NULL,
    PRIMARY KEY (SCH_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_alarm
(
    ALR_ID        VARCHAR(255) NOT NULL,
    ALR_MSG       VARCHAR(255) NOT NULL,
    ALR_URL       VARCHAR(255) NOT NULL,
    ALR_READ_STAT BOOLEAN      NOT NULL DEFAULT FALSE,
    CREATED_AT    CHAR(19)     NOT NULL,
    MEM_ID        VARCHAR(255) NOT NULL,
    PRIMARY KEY (ALR_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_member_detail
(
    MEM_DET_ID   VARCHAR(255) NOT NULL,
    MEM_DET_REL  VARCHAR(255) NOT NULL,
    MEM_DET_NAME VARCHAR(255) NOT NULL,
    MEM_ID       VARCHAR(255) NOT NULL,
    PRIMARY KEY (MEM_DET_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_UPDATE_HISTORY
(
    UPD_ID     VARCHAR(255) NOT NULL,
    UPD_IP     VARCHAR(255) NOT NULL,
    UPDATED_AT CHAR(19)     NOT NULL,
    MEM_ID     VARCHAR(255) NOT NULL,
    PRIMARY KEY (UPD_ID),
    FOREIGN KEY (MEM_ID) REFERENCES tb_member (MEM_ID)
);

CREATE TABLE tb_PRODUCT_OPTION
(
    PROD_ID          VARCHAR(255) NOT NULL,
    PROD_SER_NO      VARCHAR(255) NOT NULL,
    OPT_CNTY         CHAR(1)      NOT NULL DEFAULT 'K',
    OPT_MNFR         CHAR(1)      NOT NULL DEFAULT 'N',
    OPT_VHC_TYPE     CHAR(1)      NOT NULL,
    OPT_CHSS         CHAR(1)      NOT NULL,
    OPT_DTIL_TYPE    CHAR(1)      NOT NULL,
    OPT_BODY_TYPE    CHAR(1)      NOT NULL,
    OPT_SFTY_DVCE    CHAR(1)      NOT NULL,
    OPT_ENGN_CPCT    CHAR(1)      NOT NULL,
    OPT_SCRT_CODE    CHAR(1)      NOT NULL,
    OPT_PRDC_YEAR    CHAR(1)      NOT NULL,
    OPT_PRDC_PLNT    CHAR(1)      NOT NULL,
    OPT_ENGN         CHAR(1)      NOT NULL DEFAULT '0',
    OPT_MSSN         CHAR(1)      NOT NULL DEFAULT '0',
    OPT_TRIM         CHAR(1)      NOT NULL DEFAULT '0',
    OPT_XTNL_COLR    CHAR(1)      NOT NULL,
    OPT_ITNL_COLR    CHAR(1)      NOT NULL,
    OPT_HUD          CHAR(1)      NOT NULL DEFAULT '0',
    OPT_NAVI         CHAR(1)      NOT NULL DEFAULT '0',
    OPT_DRVE_WISE    CHAR(1)      NOT NULL DEFAULT '0',
    OPT_SMRT_CNCT    CHAR(1)      NOT NULL DEFAULT '0',
    OPT_STYL         CHAR(1)      NOT NULL DEFAULT '0',
    OPT_MY_CFRT_PCKG CHAR(1)      NOT NULL DEFAULT '0',
    OPT_OTDR_PCKG    CHAR(1)      NOT NULL DEFAULT '0',
    OPT_SUN_ROOF     CHAR(1)      NOT NULL DEFAULT '0',
    OPT_SOND         CHAR(1)      NOT NULL DEFAULT '0',
    ACTIVE           BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (PROD_ID, PROD_SER_NO),
    FOREIGN KEY (PROD_ID, PROD_SER_NO) REFERENCES tb_product (PROD_ID, PROD_SER_NO) ON DELETE CASCADE
);

CREATE TABLE tb_sales_history
(
    SAL_HIST_ID VARCHAR(255) NOT NULL COMMENT 'Comment 1번 참고',
    CONR_ID     VARCHAR(255) NOT NULL COMMENT 'Comment 1번 참고'
);

-- SET foreign_key_checks = 0;
--
--
-- -- 테이블 삭제 순서
-- DROP TABLE IF EXISTS MEMBER;
-- DROP TABLE IF EXISTS CENTER;
--
-- -- 테이블 생성
-- CREATE TABLE member (
--     member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
--     member_active BOOLEAN NOT NULL,
--     member_created_at TIMESTAMP,
--     member_email VARCHAR(255),
--     member_login_id VARCHAR(50) UNIQUE,
--     member_name VARCHAR(100),
--     member_password VARCHAR(255),
--     member_phone VARCHAR(15),
--     member_role VARCHAR(50),
--     member_updated_at TIMESTAMP
-- );
--
-- CREATE TABLE center (
-- #     CENT_ID VARCHAR(255) NOT NULL PRIMARY KEY,
--     CENT_ID BIGINT AUTO_INCREMENT NOT NULL PRIMARY KEY,
--     CENT_NAME VARCHAR(255) NOT NULL,
--     CENT_ADR VARCHAR(255) NOT NULL,
--     CENT_PHO VARCHAR(255) NOT NULL,
--     CENT_MEM_CNT INTEGER NOT NULL,
--     CENT_OPR_AT VARCHAR(255) NOT NULL,
--     CREATED_AT CHAR(19) NOT NULL,
--     UPDATED_AT CHAR(19) NOT NULL DEFAULT CREATED_AT,
--     DELETED_AT CHAR(19) NULL,
--     ACTIVE BOOLEAN NOT NULL
-- );
--
-- -- 제약 조건 추가
--
--
-- -- 더미 데이터 삽입
--