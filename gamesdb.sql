-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema gamesdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema gamesdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `gamesdb` DEFAULT CHARACTER SET utf8 ;
USE `gamesdb` ;

-- -----------------------------------------------------
-- Table `gamesdb`.`app`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`app` (
  `steam_id` VARCHAR(7) NOT NULL,
  `internal_name` VARCHAR(100) NULL DEFAULT NULL,
  `title` VARCHAR(100) NULL DEFAULT NULL,
  `steam_rating_text` ENUM('Overwhelmingly Positive', 'Very Positive', 'Positive', 'Mostly Positive', 'Mixed', 'Mostly Negative', 'Negative', 'Very Negative', 'Overwhelmingly Negative') NULL DEFAULT NULL,
  `steam_rating_percent` VARCHAR(3) NULL DEFAULT NULL,
  `steam_rating_positive` INT(11) NULL DEFAULT NULL,
  `steam_rating_negative` INT(11) NULL DEFAULT NULL,
  `release_date` VARCHAR(11) NULL DEFAULT NULL,
  `last_change` VARCHAR(11) NULL DEFAULT NULL,
  `metacritic_link` VARCHAR(100) NULL DEFAULT NULL,
  `thumbnail` VARCHAR(100) NULL DEFAULT NULL,
  `owners` INT(11) NULL DEFAULT NULL,
  `players_forever` INT(11) NULL DEFAULT NULL,
  `players_2weeks` INT(11) NULL DEFAULT NULL,
  `average_forever` INT(11) NULL DEFAULT NULL,
  `average_2weeks` INT(11) NULL DEFAULT NULL,
  `median_forever` INT(11) NULL DEFAULT NULL,
  `median_2weeks` INT(11) NULL DEFAULT NULL,
  `on_sale` TINYINT NULL DEFAULT 0,
  PRIMARY KEY (`steam_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `gamesdb`.`price_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`price_history` (
  `price_history_id` INT NOT NULL AUTO_INCREMENT,
  `app_steam_id` VARCHAR(7) NOT NULL,
  `price` VARCHAR(7) NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  PRIMARY KEY (`price_history_id`),
  INDEX `fk_price_history_app_idx` (`app_steam_id` ASC),
  CONSTRAINT `fk_price_history_app`
    FOREIGN KEY (`app_steam_id`)
    REFERENCES `gamesdb`.`app` (`steam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gamesdb`.`sale_history`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`sale_history` (
  `sale_history_id` INT NOT NULL AUTO_INCREMENT,
  `app_steam_id` VARCHAR(7) NOT NULL,
  `price` VARCHAR(7) NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  PRIMARY KEY (`sale_history_id`),
  INDEX `fk_sale_history_app1_idx` (`app_steam_id` ASC),
  CONSTRAINT `fk_sale_history_app1`
    FOREIGN KEY (`app_steam_id`)
    REFERENCES `gamesdb`.`app` (`steam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gamesdb`.`package_master`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`package_master` (
  `package_master_id` INT NOT NULL AUTO_INCREMENT,
  `app_steam_id` VARCHAR(7) NOT NULL,
  PRIMARY KEY (`package_master_id`),
  INDEX `fk_package_master_app2_idx` (`app_steam_id` ASC),
  CONSTRAINT `fk_package_master_app2`
    FOREIGN KEY (`app_steam_id`)
    REFERENCES `gamesdb`.`app` (`steam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gamesdb`.`company`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`company` (
  `company_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  PRIMARY KEY (`company_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gamesdb`.`publisher`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`publisher` (
  `company_company_id` INT NOT NULL,
  `app_steam_id` VARCHAR(7) NOT NULL,
  PRIMARY KEY (`company_company_id`, `app_steam_id`),
  INDEX `fk_publisher_app1_idx` (`app_steam_id` ASC),
  CONSTRAINT `fk_publisher_company1`
    FOREIGN KEY (`company_company_id`)
    REFERENCES `gamesdb`.`company` (`company_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_publisher_app1`
    FOREIGN KEY (`app_steam_id`)
    REFERENCES `gamesdb`.`app` (`steam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gamesdb`.`developer`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`developer` (
  `company_company_id` INT NOT NULL,
  `app_steam_id` VARCHAR(7) NOT NULL,
  PRIMARY KEY (`company_company_id`, `app_steam_id`),
  INDEX `fk_developer_app1_idx` (`app_steam_id` ASC),
  CONSTRAINT `fk_developer_company1`
    FOREIGN KEY (`company_company_id`)
    REFERENCES `gamesdb`.`company` (`company_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_developer_app1`
    FOREIGN KEY (`app_steam_id`)
    REFERENCES `gamesdb`.`app` (`steam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gamesdb`.`package_master`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`package_master` (
  `package_master_id` INT NOT NULL AUTO_INCREMENT,
  `app_steam_id` VARCHAR(7) NOT NULL,
  PRIMARY KEY (`package_master_id`),
  INDEX `fk_package_master_app2_idx` (`app_steam_id` ASC),
  CONSTRAINT `fk_package_master_app2`
    FOREIGN KEY (`app_steam_id`)
    REFERENCES `gamesdb`.`app` (`steam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `gamesdb`.`app_package`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gamesdb`.`app_package` (
  `package_master_package_master_id` INT NOT NULL,
  `app_steam_id` VARCHAR(7) NOT NULL,
  PRIMARY KEY (`package_master_package_master_id`, `app_steam_id`),
  INDEX `fk_app_package_app2_idx` (`app_steam_id` ASC),
  CONSTRAINT `fk_app_package_package_master2`
    FOREIGN KEY (`package_master_package_master_id`)
    REFERENCES `gamesdb`.`package_master` (`package_master_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_app_package_app2`
    FOREIGN KEY (`app_steam_id`)
    REFERENCES `gamesdb`.`app` (`steam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
