# @v0rt4c/ot-otb

> This library reads and writes Open Tibia .OTB files. 

## Table of contents

- [@v0rt4c/ot-otb](#v0rt4cot-otb)
    - [Table of contents](#table-of-contents)
    - [Getting Started](#getting-started)
    - [Usage](#usage)
        - [Reading .OTB](#reading-otb)
        - [Writing .OTB](#writing-otb)
    - [API](#api)
      - [RootNode](#rootnode)
        - [Constructor](#constructor)
        - [Properties](#properties)
        - [Methods](#methods)
      - [Item](#item)
        - [Constructor](#constructor)
        - [Properties](#properties)
        - [Methods](#methods)
    - [Authors](#authors)
    - [License](#license)

## Getting Started
The library supports multiple platforms (Browser, NodeJS and Deno).

### NodeJS

#### CommonJS
```js
const { OTBReader, OTBWriter } = require('@v0rt4c/ot-otb');
```

#### ES6
```js
import { OTBReader, OTBWriter } from '@v0rt4c/ot-otb';
```

### Deno
```ts
import { OTBReader, OTBWriter } from 'https://deno.land/x/v0rt4c_otb@0.1.0/mod.ts';
```

## Usage

### Reading .OTB
Reading the .OTB file is really easy. Simply create a new instance of the OTBReader and provide it with the 
.OTB file buffer. The buffer param must be a Uint8Array. Then call the ***parse*** method to get the RootNode.
```ts
const reader = new OTBReader(otbBuffer);
const rootNode = reader.parse();

console.log(rootNode);
```

***Output***
```sh
RootNode {
  _itemsMajorVersion: 1,
  _itemsMinorVersion: 3,
  _itemsBuildNumber: 17,
  _children: [Item, Item, Item, Item, ..., ...]
  }
```

### Writing .OTB
Writing the .OTB file back to its original form is also really easy. Simply create a new instance of the OTBWriter and provide
it with the RootNode. Then call the ***writeBuffer*** method. This will give you the .OTB buffer back as the return value.
```ts
const writer = new OTBWriter(rootNode);
const buffer = writer.writeBuffer();
```

## API


### RootNode
The RootNode class holds information about the .OTB file such as the versions & buildnumber.
It also holds all the items in the .OTB file in an array.

#### Constructor

| @Params           | Optional |
|-------------------|----------|
| itemsMajorVersion | false    |
| itemsMinorVersion | false    |
| itemsBuildVersion | false    |

#### Properties
| Property          | Getter | Setter |
|-------------------|--------|--------|
| itemsMajorVersion | X      | X      |
| itemsMinorVersion | X      | X      |
| itemsBuildNumber  | X      | X      |
| children          | X      |        |

#### Methods

| Method               | Params            | Description                                     |
|----------------------|-------------------|-------------------------------------------------|
| addItem              | item : Item       | Adds a new item to the root node                |
| getItemByServerId    | serverId : number | Gets a specific item by its server ID           |
| getItemByClientId    | clientId : number | Gets a specific item by its client ID           |
| removeItemByServerId | serverId : number | Removes an item by providing its server ID      |
| removeItemByClientId | clientId : number | Removes an item by providing its client ID      |
| popItem              |                   | Removes an item from the end of the item list   |
| shiftItem            |                   | Removes an item from the start of the item list |

### Item
The Item class holds information about an item, such as the server ID, client ID, flags & attributes.

#### Constructor
The Item constructor takes no arguments.

#### Properties
| Property   | Getter | Setter |
|------------|--------|--------|
| serverId   | X      | X      |
| clientId   | X      | X      |
| type       | X      | X      |
| group      | X      | X      |
| flags      | X      |        |
| attributes | X      |        |

#### Methods

| Method           | Params                          | Description                                     |
|------------------|---------------------------------|-------------------------------------------------|
| setAttribute     | attribute : string, value : any | Sets an attribute on the item                   |
| setFlags         | flags : number                  | Sets the item flags from the provided integer   |
| setFlag          | flag : string, value : boolean  | Sets a specific flag                            |
| getFlagsInt      |                                 | Returns the integer value for the item flags    |

## Authors
V0RT4C

## License
MIT License