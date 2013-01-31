CREATE TABLE `condition_types` (
  `id` INTEGER PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `operator` UNSIGNED INTEGER(1) NOT NULL -- Note: We surely won't have more than 10 operators...
  -- The operator is not a refernece to another table because we will need to hardcode action depending on the operator value in the code anyway
  -- So, putting a table to store the operators would be useless 
  -- (actually, would only restrict the value we could put there, but we might replace by an ENUM if we want that)
);


