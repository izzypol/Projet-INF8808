/**
 * Process raw data into matrix format for chord diagram.
 * 
 * @param {Array} rawData The actor-director collaboration data
 * @param {number} maxEntities Maximum number of entities to include
 * @param {Object} collabs The collabs object containing actor-director and actor-actor collaborations
 * @param {string} [selectedEntity] Optional name of selected entity to ensure connections
 * @returns {Object} Processed data object with matrix, entities and types
 */
export function processData(rawData, maxEntities, collabs, selectedEntity = null) {
  // First get all actors from actorDirectorData
  const actorsFromDirectorData = [...new Set(rawData.flatMap(c => {
    if (c.connectionType === "actor/director") {
      return [c.participant1];
    } else if (c.connectionType === "actor/actor") {
      return [c.participant2, c.participant1];
    } 
  }))];

  const writerFromDirectorData = [...new Set(rawData.flatMap(c => {
    if (c.connectionType === "writer/director") {
      return [c.participant1];
    }
  }))];
  
  // Get all actor-actor collaborations from collabs
  const actorActorCollabs = collabs.filter(c => 
    c.connectionType === "actor/actor" && 
    actorsFromDirectorData.includes(c.participant1) && 
    actorsFromDirectorData.includes(c.participant2)
  );

  // Get all directors from actorDirectorData
  const directors = [...new Set(rawData.map(c => c.participant2))];

  // Calculate counts for actors and directors
  const actorCounts = {}, directorCounts = {}, writerCounts = {};
  rawData.forEach(c => {
    if (c.connectionType === "actor/director") {
      const actor = c.participant1;
      const director = c.participant2;
      actorCounts[actor] = (actorCounts[actor] || 0) + c.count;
      directorCounts[director] = (directorCounts[director] || 0) + c.count;
    } else if (c.connectionType === "actor/actor") {
      const actor1 = c.participant1;
      const actor2 = c.participant2;
      actorCounts[actor1] = (actorCounts[actor1] || 0) + c.count;
      actorCounts[actor2] = (actorCounts[actor2] || 0) + c.count;
    } else if (c.connectionType === "writer/director") {
      const writer = c.participant1;
      const director = c.participant2;
      writerCounts[writer] = (writerCounts[writer] || 0) + c.count;
      directorCounts[director] = (directorCounts[director] || 0) + c.count;
    }
  });

  // Get top actors, directors and writers
  const actorCount = Math.floor(maxEntities / 3);
  const directorCount = Math.floor(maxEntities / 3);
  const writerCount = maxEntities - actorCount - directorCount; // Remaining entities
  
  const topActors = actorsFromDirectorData
    .sort((a, b) => actorCounts[b] - actorCounts[a])
    .slice(0, actorCount);
  
  const topDirectors = directors
    .sort((a, b) => directorCounts[b] - directorCounts[a])
    .slice(0, directorCount);

  const topWriters = writerFromDirectorData
    .sort((a, b) => writerCounts[b] - writerCounts[a])
    .slice(0, writerCount);
  
  const allEntities = [...topActors, ...topDirectors, ...topWriters];
  const allTypes = [
    ...topActors.map(() => 'actor'), 
    ...topDirectors.map(() => 'director'),
    ...topWriters.map(() => 'writer')
  ];

  // Create initial matrix with all potential entities
  const initialMatrix = Array.from({ length: allEntities.length }, () => Array(allEntities.length).fill(0));
  
  // Add actor-director connections from actorDirectorData
  rawData.forEach(c => {
    if (c.connectionType === "actor/actor") return;
    const actorOrWriter = c.participant1;
    const director = c.participant2;
    
    const aIdx = allEntities.indexOf(actorOrWriter);
    const dIdx = allEntities.indexOf(director);
    
    if (aIdx !== -1 && dIdx !== -1) {
      initialMatrix[aIdx][dIdx] = c.count;
      initialMatrix[dIdx][aIdx] = c.count;
    }
  });
  
  // Add actor-actor connections from actorActorCollabs
  actorActorCollabs.forEach(c => {
    const a1Idx = allEntities.indexOf(c.participant1);
    const a2Idx = allEntities.indexOf(c.participant2);
    
    if (a1Idx !== -1 && a2Idx !== -1) {
      initialMatrix[a1Idx][a2Idx] = c.count;
      initialMatrix[a2Idx][a1Idx] = c.count;
    }
  });


  // Now filter out entities that have no connections
  const connectedIndices = new Set();
  
  // Find all indices that have at least one connection
  for (let i = 0; i < initialMatrix.length; i++) {
    for (let j = 0; j < initialMatrix[i].length; j++) {
      if (initialMatrix[i][j] > 0) {
        connectedIndices.add(i);
        connectedIndices.add(j);
      }
    }
  }

  // If no entities have connections, return empty data
  if (connectedIndices.size === 0) {
    return { matrix: [], entities: [], types: [] };
  }

  // If we have a selected entity, filter to include only entities connected to it
  if (selectedEntity) {
    const selectedIdx = allEntities.indexOf(selectedEntity);
    
    // If the selected entity isn't in our list, return empty data
    if (selectedIdx === -1) {
      return { matrix: [], entities: [], types: [] };
    }
    
    // Only keep indices that have a direct connection to the selected entity
    const directlyConnectedIndices = new Set();
    directlyConnectedIndices.add(selectedIdx); // Add the selected entity itself
    
    // Add indices that have a connection to the selected entity
    for (let i = 0; i < initialMatrix.length; i++) {
      if (initialMatrix[selectedIdx][i] > 0) {
        directlyConnectedIndices.add(i);
      }
    }
    
    // Replace our connected indices with only those directly connected to selected entity
    connectedIndices.clear();
    directlyConnectedIndices.forEach(idx => connectedIndices.add(idx));
  }

  // Create new arrays with only connected entities
  const connectedEntities = [];
  const connectedTypes = [];
  const indexMap = {}; // Maps old indices to new indices
  
  Array.from(connectedIndices).sort((a, b) => a - b).forEach((oldIndex, newIndex) => {
    connectedEntities.push(allEntities[oldIndex]);
    connectedTypes.push(allTypes[oldIndex]);
    indexMap[oldIndex] = newIndex;
  });

  // Create new matrix with only connected entities
  const matrix = Array.from({ length: connectedEntities.length }, () => Array(connectedEntities.length).fill(0));
  
  // Populate the new matrix with connections
  for (let i = 0; i < initialMatrix.length; i++) {
    if (indexMap[i] === undefined) continue;
    for (let j = 0; j < initialMatrix[i].length; j++) {
      if (indexMap[j] === undefined) continue;
      if (initialMatrix[i][j] > 0) {
        matrix[indexMap[i]][indexMap[j]] = initialMatrix[i][j];
        matrix[indexMap[j]][indexMap[i]] = initialMatrix[i][j];
      }
    }
  }

  return { matrix, entities: connectedEntities, types: connectedTypes };
}

/**
 * Filter data to focus on a specific entity.
 * 
 * @param {string} entityName The name of the entity to focus on
 * @param {Object} collabs The collaboration data
 * @returns {Array} Filtered collaboration data related to the selected entity
 */
export function filterDataByEntity(entityName, collabs) {
  if (!entityName) {
    return [];
  }
  
  // 1. Get direct collaborations with this entity (both types)
  const directCollabs = collabs.filter(c => 
    c.participant1 === entityName || c.participant2 === entityName
  );
  
  // 2. Find all entities that directly collaborate with the selected entity
  const connectedEntities = [...new Set(
    directCollabs.map(c => c.participant1 === entityName ? c.participant2 : c.participant1)
  )];
  
  // 3. Get collaborations between entities directly connected to the selected entity
  const connectedEntityCollabs = collabs.filter(c => 
    // Both participants must be connected to the selected entity
    connectedEntities.includes(c.participant1) && 
    connectedEntities.includes(c.participant2) &&
    // And we're not including the original entity again
    c.participant1 !== entityName && c.participant2 !== entityName
  );
  
  // Combine direct and connected entity collaborations
  return [...directCollabs, ...connectedEntityCollabs];
}

/**
 * Get all unique entities for autocomplete.
 * 
 * @param {Object} collabs Collaboration data
 * @returns {Array} Array of entities with name and type
 */
export function getEntitiesForAutocomplete(collabs) {
  // Get unique actors from actor-director collaborations
  const actors = [...new Set(collabs.actorDirectorCollabs.map(c => c.actor))];
  
  // Get unique directors from actor-director collaborations
  const directors = [...new Set(collabs.actorDirectorCollabs.map(c => c.director))];
  
  // Combine into a single array with type info
  return [
    ...actors.map(name => ({ name, type: 'actor' })),
    ...directors.map(name => ({ name, type: 'director' }))
  ];
}

/**
 * Filter entities for autocomplete based on search term.
 * 
 * @param {Array} entities Array of entities with name and type
 * @param {string} searchTerm The search term to filter by
 * @param {number} maxResults Maximum number of results to return
 * @returns {Array} Filtered entities matching the search term
 */
export function filterEntitiesForAutocomplete(entities, searchTerm, maxResults) {
  // Convert search term to lowercase for case-insensitive matching
  const search = searchTerm.toLowerCase();
  
  // Filter entities that include the search term
  const filtered = entities.filter(entity => 
    entity.name.toLowerCase().includes(search)
  );
  
  // Limit results and return
  return filtered.slice(0, maxResults);
}

export function handleEntitySelect(entityName, entityType, collabs, maxEntSelect, renderChordDiagram, currentData, highlightEntity, searchInput, dropdown) {
  const filteredCollabs = filterDataByEntity(entityName, entityType, collabs);
  const newData = processData(filteredCollabs, maxEntSelect.value, collabs, entityName);
  
  renderChordDiagram(newData);
  
  currentData = newData;
  
  const idx = newData.entities.findIndex(name => name === entityName);
  highlightEntity = idx !== -1 ? idx : null;
  
  searchInput.value = entityName;
  
  dropdown.style("display", "none");
};
