CREATE TABLE `monthly_stats` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `sensor_id` INTEGER NOT NULL,
  `sensor_type_id` INTEGER NOT NULL,
  `value` INTEGER NOT NULL,
  `min` INTEGER ,
  `max` INTEGER ,
  `time` INTEGER NOT NULL,
  FOREIGN KEY(sensor_type_id) REFERENCES sensor_types(id)
);

INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,25,22,26,'2011-03-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,25,'2011-04-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,20,25,'2011-05-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,21,24,'2011-06-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,25,'2011-07-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2011-08-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2011-09-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2011-10-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,19,18,21,'2011-11-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,19,21,'2011-12-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2012-01-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2012-02-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2012-03-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2012-04-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,25,'2012-05-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,21,23,'2012-06-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,21,23,'2012-07-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,20,20,'2012-08-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2012-09-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2012-10-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,19,21,'2012-11-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,25,22,28,'2012-12-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-01-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,26,'2013-02-01');


INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,25,'2011-03-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2011-04-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2011-05-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2011-06-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2011-07-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2011-08-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2011-09-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2011-10-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,19,'2011-11-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2011-12-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2012-01-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2012-02-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2012-03-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2012-04-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2012-05-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2012-06-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2012-07-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2012-08-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2012-09-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2012-10-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2012-11-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,25,'2012-12-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-01-01');
INSERT INTO monthly_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-01');