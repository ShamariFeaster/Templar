-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 13, 2015 at 02:02 AM
-- Server version: 5.6.12-log
-- PHP Version: 5.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

CREATE TABLE IF NOT EXISTS `ads` (
  `uid` int(10) unsigned NOT NULL COMMENT 'FK of ''user'' table',
  `ad_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `state` varchar(30) NOT NULL,
  `city` varchar(30) NOT NULL,
  `price` mediumint(9) DEFAULT NULL,
  `title` tinytext NOT NULL,
  `description` text NOT NULL,
  `ad_type` varchar(75) NOT NULL,
  `ad_category` varchar(75) NOT NULL,
  `ad_state` enum('draft','active','deactivated') NOT NULL DEFAULT 'draft',
  `start` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end` datetime DEFAULT NULL,
  `phone_num` tinytext,
  `contact_methods` set('Call/Text','Email','Private Message') DEFAULT NULL,
  PRIMARY KEY (`ad_id`),
  KEY `uid` (`uid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=77 ;

-- --------------------------------------------------------

--
-- Table structure for table `ad_pics`
--

CREATE TABLE IF NOT EXISTS `ad_pics` (
  `ad_pic_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ad_id` int(10) unsigned DEFAULT NULL,
  `image_uri` tinytext NOT NULL,
  PRIMARY KEY (`ad_pic_id`),
  KEY `ad_id` (`ad_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=144 ;

-- --------------------------------------------------------

--
-- Table structure for table `credentials`
--

CREATE TABLE IF NOT EXISTS `credentials` (
  `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `un` varchar(20) NOT NULL,
  `pw` tinytext NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `un` (`un`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 COMMENT='This table holds the credentials for all users of the system' AUTO_INCREMENT=34 ;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `uid` int(10) unsigned NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `role` enum('guest','basic','premium','admin') NOT NULL DEFAULT 'guest',
  `email` varchar(50) NOT NULL,
  `profile_pic_uri` tinytext,
  `pp_mime` tinytext,
  `sex` set('m','f','na') NOT NULL DEFAULT 'na',
  `fn` tinytext NOT NULL,
  `ln` tinytext NOT NULL,
  `age` tinyint(3) unsigned NOT NULL,
  `state` tinytext NOT NULL,
  `city` tinytext NOT NULL,
  `description` text NOT NULL,
  `phone_num` tinytext NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ads`
--
ALTER TABLE `ads`
  ADD CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `credentials` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ad_pics`
--
ALTER TABLE `ad_pics`
  ADD CONSTRAINT `ad_pics_ibfk_1` FOREIGN KEY (`ad_id`) REFERENCES `ads` (`ad_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `credentials` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
