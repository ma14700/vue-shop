import * as THREE from 'three';
let THREEAll = {
  installDDSLoader: function (THREE) {
    THREE.DDSLoader = function () {

      this._parser = THREE.DDSLoader.parse;

    };

    THREE.DDSLoader.prototype = Object.create(THREE.CompressedTextureLoader.prototype);
    THREE.DDSLoader.prototype.constructor = THREE.DDSLoader;

    THREE.DDSLoader.parse = function (buffer, loadMipmaps) {

      var dds = {
        mipmaps: [],
        width: 0,
        height: 0,
        format: null,
        mipmapCount: 1
      };

      // Adapted from @toji's DDS utils
      // https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

      // All values and structures referenced from:
      // http://msdn.microsoft.com/en-us/library/bb943991.aspx/

      var DDS_MAGIC = 0x20534444;

      var DDSD_CAPS = 0x1,
        DDSD_HEIGHT = 0x2,
        DDSD_WIDTH = 0x4,
        DDSD_PITCH = 0x8,
        DDSD_PIXELFORMAT = 0x1000,
        DDSD_MIPMAPCOUNT = 0x20000,
        DDSD_LINEARSIZE = 0x80000,
        DDSD_DEPTH = 0x800000;

      var DDSCAPS_COMPLEX = 0x8,
        DDSCAPS_MIPMAP = 0x400000,
        DDSCAPS_TEXTURE = 0x1000;

      var DDSCAPS2_CUBEMAP = 0x200,
        DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
        DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
        DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
        DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
        DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
        DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000,
        DDSCAPS2_VOLUME = 0x200000;

      var DDPF_ALPHAPIXELS = 0x1,
        DDPF_ALPHA = 0x2,
        DDPF_FOURCC = 0x4,
        DDPF_RGB = 0x40,
        DDPF_YUV = 0x200,
        DDPF_LUMINANCE = 0x20000;

      function fourCCToInt32(value) {

        return value.charCodeAt(0) +
          (value.charCodeAt(1) << 8) +
          (value.charCodeAt(2) << 16) +
          (value.charCodeAt(3) << 24);

      }

      function int32ToFourCC(value) {

        return String.fromCharCode(
          value & 0xff,
          (value >> 8) & 0xff,
          (value >> 16) & 0xff,
          (value >> 24) & 0xff
        );

      }

      function loadARGBMip(buffer, dataOffset, width, height) {

        var dataLength = width * height * 4;
        var srcBuffer = new Uint8Array(buffer, dataOffset, dataLength);
        var byteArray = new Uint8Array(dataLength);
        var dst = 0;
        var src = 0;
        for (var y = 0; y < height; y++) {

          for (var x = 0; x < width; x++) {

            var b = srcBuffer[src];
            src++;
            var g = srcBuffer[src];
            src++;
            var r = srcBuffer[src];
            src++;
            var a = srcBuffer[src];
            src++;
            byteArray[dst] = r;
            dst++; //r
            byteArray[dst] = g;
            dst++; //g
            byteArray[dst] = b;
            dst++; //b
            byteArray[dst] = a;
            dst++; //a

          }

        }
        return byteArray;

      }

      var FOURCC_DXT1 = fourCCToInt32("DXT1");
      var FOURCC_DXT3 = fourCCToInt32("DXT3");
      var FOURCC_DXT5 = fourCCToInt32("DXT5");
      var FOURCC_ETC1 = fourCCToInt32("ETC1");

      var headerLengthInt = 31; // The header length in 32 bit ints

      // Offsets into the header array

      var off_magic = 0;

      var off_size = 1;
      var off_flags = 2;
      var off_height = 3;
      var off_width = 4;

      var off_mipmapCount = 7;

      var off_pfFlags = 20;
      var off_pfFourCC = 21;
      var off_RGBBitCount = 22;
      var off_RBitMask = 23;
      var off_GBitMask = 24;
      var off_BBitMask = 25;
      var off_ABitMask = 26;

      var off_caps = 27;
      var off_caps2 = 28;
      var off_caps3 = 29;
      var off_caps4 = 30;

      // Parse header

      var header = new Int32Array(buffer, 0, headerLengthInt);

      if (header[off_magic] !== DDS_MAGIC) {

        console.error('THREE.DDSLoader.parse: Invalid magic number in DDS header.');
        return dds;

      }

      if (!header[off_pfFlags] & DDPF_FOURCC) {

        console.error('THREE.DDSLoader.parse: Unsupported format, must contain a FourCC code.');
        return dds;

      }

      var blockBytes;

      var fourCC = header[off_pfFourCC];

      var isRGBAUncompressed = false;

      switch (fourCC) {

        case FOURCC_DXT1:

          blockBytes = 8;
          dds.format = THREE.RGB_S3TC_DXT1_Format;
          break;

        case FOURCC_DXT3:

          blockBytes = 16;
          dds.format = THREE.RGBA_S3TC_DXT3_Format;
          break;

        case FOURCC_DXT5:

          blockBytes = 16;
          dds.format = THREE.RGBA_S3TC_DXT5_Format;
          break;

        case FOURCC_ETC1:

          blockBytes = 8;
          dds.format = THREE.RGB_ETC1_Format;
          break;

        default:

          if (header[off_RGBBitCount] === 32 &&
            header[off_RBitMask] & 0xff0000 &&
            header[off_GBitMask] & 0xff00 &&
            header[off_BBitMask] & 0xff &&
            header[off_ABitMask] & 0xff000000) {

            isRGBAUncompressed = true;
            blockBytes = 64;
            dds.format = THREE.RGBAFormat;

          } else {

            console.error('THREE.DDSLoader.parse: Unsupported FourCC code ', int32ToFourCC(fourCC));
            return dds;

          }

      }

      dds.mipmapCount = 1;

      if (header[off_flags] & DDSD_MIPMAPCOUNT && loadMipmaps !== false) {

        dds.mipmapCount = Math.max(1, header[off_mipmapCount]);

      }

      var caps2 = header[off_caps2];
      dds.isCubemap = caps2 & DDSCAPS2_CUBEMAP ? true : false;
      if (dds.isCubemap && (!(caps2 & DDSCAPS2_CUBEMAP_POSITIVEX) ||
          !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEX) ||
          !(caps2 & DDSCAPS2_CUBEMAP_POSITIVEY) ||
          !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEY) ||
          !(caps2 & DDSCAPS2_CUBEMAP_POSITIVEZ) ||
          !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEZ)
        )) {

        console.error('THREE.DDSLoader.parse: Incomplete cubemap faces');
        return dds;

      }

      dds.width = header[off_width];
      dds.height = header[off_height];

      var dataOffset = header[off_size] + 4;

      // Extract mipmaps buffers

      var faces = dds.isCubemap ? 6 : 1;

      for (var face = 0; face < faces; face++) {

        var width = dds.width;
        var height = dds.height;

        for (var i = 0; i < dds.mipmapCount; i++) {

          if (isRGBAUncompressed) {

            var byteArray = loadARGBMip(buffer, dataOffset, width, height);
            var dataLength = byteArray.length;

          } else {

            var dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;
            var byteArray = new Uint8Array(buffer, dataOffset, dataLength);

          }

          var mipmap = {
            "data": byteArray,
            "width": width,
            "height": height
          };
          dds.mipmaps.push(mipmap);

          dataOffset += dataLength;

          width = Math.max(width >> 1, 1);
          height = Math.max(height >> 1, 1);

        }

      }

      return dds;

    };

  },
  installOBJLoader:function(THREE){
    THREE.OBJLoader = (function() {
        
            // o object_name | g group_name
            var object_pattern = /^[og]\s*(.+)?/;
            // mtllib file_reference
            var material_library_pattern = /^mtllib /;
            // usemtl material_name
            var material_use_pattern = /^usemtl /;
        
            function ParserState() {
        
                var state = {
                    objects: [],
                    object: {},
        
                    vertices: [],
                    normals: [],
                    colors: [],
                    uvs: [],
        
                    materialLibraries: [],
        
                    startObject: function(name, fromDeclaration) {
        
                        // If the current object (initial from reset) is not from a g/o declaration in the parsed
                        // file. We need to use it for the first parsed g/o to keep things in sync.
                        if (this.object && this.object.fromDeclaration === false) {
        
                            this.object.name = name;
                            this.object.fromDeclaration = (fromDeclaration !== false);
                            return;
        
                        }
        
                        var previousMaterial = (this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined);
        
                        if (this.object && typeof this.object._finalize === 'function') {
        
                            this.object._finalize(true);
        
                        }
        
                        this.object = {
                            name: name || '',
                            fromDeclaration: (fromDeclaration !== false),
        
                            geometry: {
                                vertices: [],
                                normals: [],
                                colors: [],
                                uvs: []
                            },
                            materials: [],
                            smooth: true,
        
                            startMaterial: function(name, libraries) {
        
                                var previous = this._finalize(false);
        
                                // New usemtl declaration overwrites an inherited material, except if faces were declared
                                // after the material, then it must be preserved for proper MultiMaterial continuation.
                                if (previous && (previous.inherited || previous.groupCount <= 0)) {
        
                                    this.materials.splice(previous.index, 1);
        
                                }
        
                                var material = {
                                    index: this.materials.length,
                                    name: name || '',
                                    mtllib: (Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : ''),
                                    smooth: (previous !== undefined ? previous.smooth : this.smooth),
                                    groupStart: (previous !== undefined ? previous.groupEnd : 0),
                                    groupEnd: -1,
                                    groupCount: -1,
                                    inherited: false,
        
                                    clone: function(index) {
        
                                        var cloned = {
                                            index: (typeof index === 'number' ? index : this.index),
                                            name: this.name,
                                            mtllib: this.mtllib,
                                            smooth: this.smooth,
                                            groupStart: 0,
                                            groupEnd: -1,
                                            groupCount: -1,
                                            inherited: false
                                        };
                                        cloned.clone = this.clone.bind(cloned);
                                        return cloned;
        
                                    }
                                };
        
                                this.materials.push(material);
        
                                return material;
        
                            },
        
                            currentMaterial: function() {
        
                                if (this.materials.length > 0) {
        
                                    return this.materials[this.materials.length - 1];
        
                                }
        
                                return undefined;
        
                            },
        
                            _finalize: function(end) {
        
                                var lastMultiMaterial = this.currentMaterial();
                                if (lastMultiMaterial && lastMultiMaterial.groupEnd === -1) {
        
                                    lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                                    lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                                    lastMultiMaterial.inherited = false;
        
                                }
        
                                // Ignore objects tail materials if no face declarations followed them before a new o/g started.
                                if (end && this.materials.length > 1) {
        
                                    for (var mi = this.materials.length - 1; mi >= 0; mi--) {
        
                                        if (this.materials[mi].groupCount <= 0) {
        
                                            this.materials.splice(mi, 1);
        
                                        }
        
                                    }
        
                                }
        
                                // Guarantee at least one empty material, this makes the creation later more straight forward.
                                if (end && this.materials.length === 0) {
        
                                    this.materials.push({
                                        name: '',
                                        smooth: this.smooth
                                    });
        
                                }
        
                                return lastMultiMaterial;
        
                            }
                        };
        
                        // Inherit previous objects material.
                        // Spec tells us that a declared material must be set to all objects until a new material is declared.
                        // If a usemtl declaration is encountered while this new object is being parsed, it will
                        // overwrite the inherited material. Exception being that there was already face declarations
                        // to the inherited material, then it will be preserved for proper MultiMaterial continuation.
        
                        if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function') {
        
                            var declared = previousMaterial.clone(0);
                            declared.inherited = true;
                            this.object.materials.push(declared);
        
                        }
        
                        this.objects.push(this.object);
        
                    },
        
                    finalize: function() {
        
                        if (this.object && typeof this.object._finalize === 'function') {
        
                            this.object._finalize(true);
        
                        }
        
                    },
        
                    parseVertexIndex: function(value, len) {
        
                        var index = parseInt(value, 10);
                        return (index >= 0 ? index - 1 : index + len / 3) * 3;
        
                    },
        
                    parseNormalIndex: function(value, len) {
        
                        var index = parseInt(value, 10);
                        return (index >= 0 ? index - 1 : index + len / 3) * 3;
        
                    },
        
                    parseUVIndex: function(value, len) {
        
                        var index = parseInt(value, 10);
                        return (index >= 0 ? index - 1 : index + len / 2) * 2;
        
                    },
        
                    addVertex: function(a, b, c) {
        
                        var src = this.vertices;
                        var dst = this.object.geometry.vertices;
        
                        dst.push(src[a + 0], src[a + 1], src[a + 2]);
                        dst.push(src[b + 0], src[b + 1], src[b + 2]);
                        dst.push(src[c + 0], src[c + 1], src[c + 2]);
        
                    },
        
                    addVertexLine: function(a) {
        
                        var src = this.vertices;
                        var dst = this.object.geometry.vertices;
        
                        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        
                    },
        
                    addNormal: function(a, b, c) {
        
                        var src = this.normals;
                        var dst = this.object.geometry.normals;
        
                        dst.push(src[a + 0], src[a + 1], src[a + 2]);
                        dst.push(src[b + 0], src[b + 1], src[b + 2]);
                        dst.push(src[c + 0], src[c + 1], src[c + 2]);
        
                    },
        
                    addColor: function(a, b, c) {
        
                        var src = this.colors;
                        var dst = this.object.geometry.colors;
        
                        dst.push(src[a + 0], src[a + 1], src[a + 2]);
                        dst.push(src[b + 0], src[b + 1], src[b + 2]);
                        dst.push(src[c + 0], src[c + 1], src[c + 2]);
        
                    },
        
                    addUV: function(a, b, c) {
        
                        var src = this.uvs;
                        var dst = this.object.geometry.uvs;
        
                        dst.push(src[a + 0], src[a + 1]);
                        dst.push(src[b + 0], src[b + 1]);
                        dst.push(src[c + 0], src[c + 1]);
        
                    },
        
                    addUVLine: function(a) {
        
                        var src = this.uvs;
                        var dst = this.object.geometry.uvs;
        
                        dst.push(src[a + 0], src[a + 1]);
        
                    },
        
                    addFace: function(a, b, c, ua, ub, uc, na, nb, nc) {
        
                        var vLen = this.vertices.length;
        
                        var ia = this.parseVertexIndex(a, vLen);
                        var ib = this.parseVertexIndex(b, vLen);
                        var ic = this.parseVertexIndex(c, vLen);
        
                        this.addVertex(ia, ib, ic);
        
                        if (ua !== undefined) {
        
                            var uvLen = this.uvs.length;
        
                            ia = this.parseUVIndex(ua, uvLen);
                            ib = this.parseUVIndex(ub, uvLen);
                            ic = this.parseUVIndex(uc, uvLen);
        
                            this.addUV(ia, ib, ic);
        
                        }
        
                        if (na !== undefined) {
        
                            // Normals are many times the same. If so, skip function call and parseInt.
                            var nLen = this.normals.length;
                            ia = this.parseNormalIndex(na, nLen);
        
                            ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
                            ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);
        
                            this.addNormal(ia, ib, ic);
        
                        }
        
                        if (this.colors.length > 0) {
        
                            this.addColor(ia, ib, ic);
        
                        }
        
                    },
        
                    addLineGeometry: function(vertices, uvs) {
        
                        this.object.geometry.type = 'Line';
        
                        var vLen = this.vertices.length;
                        var uvLen = this.uvs.length;
        
                        for (var vi = 0, l = vertices.length; vi < l; vi++) {
        
                            this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));
        
                        }
        
                        for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {
        
                            this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));
        
                        }
        
                    }
        
                };
        
                state.startObject('', false);
        
                return state;
        
            }
        
            //
        
            function OBJLoader(manager) {
        
                this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
        
                this.materials = null;
        
            }
        
            OBJLoader.prototype = {
        
                constructor: OBJLoader,
        
                load: function(url, onLoad, onProgress, onError) {
        
                    var scope = this;
        
                    var loader = new THREE.FileLoader(scope.manager);
                    loader.setPath(this.path);
                    loader.load(url, function(text) {
        
                        onLoad(scope.parse(text));
        
                    }, onProgress, onError);
        
                },
        
                setPath: function(value) {
        
                    this.path = value;
        
                },
        
                setMaterials: function(materials) {
        
                    this.materials = materials;
        
                    return this;
        
                },
        
                parse: function(text) {
        
                    console.time('OBJLoader');
        
                    var state = new ParserState();
        
                    if (text.indexOf('\r\n') !== -1) {
        
                        // This is faster than String.split with regex that splits on both
                        text = text.replace(/\r\n/g, '\n');
        
                    }
        
                    if (text.indexOf('\\\n') !== -1) {
        
                        // join lines separated by a line continuation character (\)
                        text = text.replace(/\\\n/g, '');
        
                    }
        
                    var lines = text.split('\n');
                    var line = '',
                        lineFirstChar = '';
                    var lineLength = 0;
                    var result = [];
        
                    // Faster to just trim left side of the line. Use if available.
                    var trimLeft = (typeof ''.trimLeft === 'function');
        
                    for (var i = 0, l = lines.length; i < l; i++) {
        
                        line = lines[i];
        
                        line = trimLeft ? line.trimLeft() : line.trim();
        
                        lineLength = line.length;
        
                        if (lineLength === 0) continue;
        
                        lineFirstChar = line.charAt(0);
        
                        // @todo invoke passed in handler if any
                        if (lineFirstChar === '#') continue;
        
                        if (lineFirstChar === 'v') {
        
                            var data = line.split(/\s+/);
        
                            switch (data[0]) {
        
                                case 'v':
                                    state.vertices.push(
                                        parseFloat(data[1]),
                                        parseFloat(data[2]),
                                        parseFloat(data[3])
                                    );
                                    if (data.length === 8) {
        
                                        state.colors.push(
                                            parseFloat(data[4]),
                                            parseFloat(data[5]),
                                            parseFloat(data[6])
        
                                        );
        
                                    }
                                    break;
                                case 'vn':
                                    state.normals.push(
                                        parseFloat(data[1]),
                                        parseFloat(data[2]),
                                        parseFloat(data[3])
                                    );
                                    break;
                                case 'vt':
                                    state.uvs.push(
                                        parseFloat(data[1]),
                                        parseFloat(data[2])
                                    );
                                    break;
        
                            }
        
                        } else if (lineFirstChar === 'f') {
        
                            var lineData = line.substr(1).trim();
                            var vertexData = lineData.split(/\s+/);
                            var faceVertices = [];
        
                            // Parse the face vertex data into an easy to work with format
        
                            for (var j = 0, jl = vertexData.length; j < jl; j++) {
        
                                var vertex = vertexData[j];
        
                                if (vertex.length > 0) {
        
                                    var vertexParts = vertex.split('/');
                                    faceVertices.push(vertexParts);
        
                                }
        
                            }
        
                            // Draw an edge between the first vertex and all subsequent vertices to form an n-gon
        
                            var v1 = faceVertices[0];
        
                            for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {
        
                                var v2 = faceVertices[j];
                                var v3 = faceVertices[j + 1];
        
                                state.addFace(
                                    v1[0], v2[0], v3[0],
                                    v1[1], v2[1], v3[1],
                                    v1[2], v2[2], v3[2]
                                );
        
                            }
        
                        } else if (lineFirstChar === 'l') {
        
                            var lineParts = line.substring(1).trim().split(" ");
                            var lineVertices = [],
                                lineUVs = [];
        
                            if (line.indexOf("/") === -1) {
        
                                lineVertices = lineParts;
        
                            } else {
        
                                for (var li = 0, llen = lineParts.length; li < llen; li++) {
        
                                    var parts = lineParts[li].split("/");
        
                                    if (parts[0] !== "") lineVertices.push(parts[0]);
                                    if (parts[1] !== "") lineUVs.push(parts[1]);
        
                                }
        
                            }
                            state.addLineGeometry(lineVertices, lineUVs);
        
                        } else if ((result = object_pattern.exec(line)) !== null) {
        
                            // o object_name
                            // or
                            // g group_name
        
                            // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
                            // var name = result[ 0 ].substr( 1 ).trim();
                            var name = (" " + result[0].substr(1).trim()).substr(1);
        
                            state.startObject(name);
        
                        } else if (material_use_pattern.test(line)) {
        
                            // material
        
                            state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
        
                        } else if (material_library_pattern.test(line)) {
        
                            // mtl file
        
                            state.materialLibraries.push(line.substring(7).trim());
        
                        } else if (lineFirstChar === 's') {
        
                            result = line.split(' ');
        
                            // smooth shading
        
                            // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                            // but does not define a usemtl for each face set.
                            // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                            // This requires some care to not create extra material on each smooth value for "normal" obj files.
                            // where explicit usemtl defines geometry groups.
                            // Example asset: examples/models/obj/cerberus/Cerberus.obj
        
                            /*
                             * http://paulbourke.net/dataformats/obj/
                             * or
                             * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
                             *
                             * From chapter "Grouping" Syntax explanation "s group_number":
                             * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
                             * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
                             * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
                             * than 0."
                             */
                            if (result.length > 1) {
        
                                var value = result[1].trim().toLowerCase();
                                state.object.smooth = (value !== '0' && value !== 'off');
        
                            } else {
        
                                // ZBrush can produce "s" lines #11707
                                state.object.smooth = true;
        
                            }
                            var material = state.object.currentMaterial();
                            if (material) material.smooth = state.object.smooth;
        
                        } else {
        
                            // Handle null terminated files without exception
                            if (line === '\0') continue;
        
                            throw new Error('THREE.OBJLoader: Unexpected line: "' + line + '"');
        
                        }
        
                    }
        
                    state.finalize();
        
                    var container = new THREE.Group();
                    container.materialLibraries = [].concat(state.materialLibraries);
        
                    for (var i = 0, l = state.objects.length; i < l; i++) {
        
                        var object = state.objects[i];
                        var geometry = object.geometry;
                        var materials = object.materials;
                        var isLine = (geometry.type === 'Line');
        
                        // Skip o/g line declarations that did not follow with any faces
                        if (geometry.vertices.length === 0) continue;
        
                        var buffergeometry = new THREE.BufferGeometry();
        
                        buffergeometry.addAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));
        
                        if (geometry.normals.length > 0) {
        
                            buffergeometry.addAttribute('normal', new THREE.Float32BufferAttribute(geometry.normals, 3));
        
                        } else {
        
                            buffergeometry.computeVertexNormals();
        
                        }
        
                        if (geometry.colors.length > 0) {
        
                            buffergeometry.addAttribute('color', new THREE.Float32BufferAttribute(geometry.colors, 3));
        
                        }
        
                        if (geometry.uvs.length > 0) {
        
                            buffergeometry.addAttribute('uv', new THREE.Float32BufferAttribute(geometry.uvs, 2));
        
                        }
        
                        // Create materials
        
                        var createdMaterials = [];
        
                        for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
        
                            var sourceMaterial = materials[mi];
                            var material = undefined;
        
                            if (this.materials !== null) {
        
                                material = this.materials.create(sourceMaterial.name);
        
                                // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
                                if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {
        
                                    var materialLine = new THREE.LineBasicMaterial();
                                    materialLine.copy(material);
                                    material = materialLine;
        
                                }
        
                            }
        
                            if (!material) {
        
                                material = (!isLine ? new THREE.MeshPhongMaterial() : new THREE.LineBasicMaterial());
                                material.name = sourceMaterial.name;
        
                            }
        
                            material.flatShading = sourceMaterial.smooth ? false : true;
        
                            createdMaterials.push(material);
        
                        }
        
                        // Create mesh
        
                        var mesh;
        
                        if (createdMaterials.length > 1) {
        
                            for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {
        
                                var sourceMaterial = materials[mi];
                                buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
        
                            }
        
                            mesh = (!isLine ? new THREE.Mesh(buffergeometry, createdMaterials) : new THREE.LineSegments(buffergeometry, createdMaterials));
        
                        } else {
        
                            mesh = (!isLine ? new THREE.Mesh(buffergeometry, createdMaterials[0]) : new THREE.LineSegments(buffergeometry, createdMaterials[0]));
        
                        }
        
                        mesh.name = object.name;
        
                        container.add(mesh);
        
                    }
        
                    console.timeEnd('OBJLoader');
        
                    return container;
        
                }
        
            };
        
            return OBJLoader;
        
        })();
  },
  installMTLLoader:function(THREE){
    THREE.MTLLoader = function(manager) {
        
            this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
        
        };
        
        THREE.MTLLoader.prototype = {
        
            constructor: THREE.MTLLoader,
        
            /**
             * Loads and parses a MTL asset from a URL.
             *
             * @param {String} url - URL to the MTL file.
             * @param {Function} [onLoad] - Callback invoked with the loaded object.
             * @param {Function} [onProgress] - Callback for download progress.
             * @param {Function} [onError] - Callback for download errors.
             *
             * @see setPath setTexturePath
             *
             * @note In order for relative texture references to resolve correctly
             * you must call setPath and/or setTexturePath explicitly prior to load.
             */
            load: function(url, onLoad, onProgress, onError) {
        
                var scope = this;
        
                var loader = new THREE.FileLoader(this.manager);
                loader.setPath(this.path);
                loader.load(url, function(text) {
        
                    onLoad(scope.parse(text));
        
                }, onProgress, onError);
        
            },
        
            /**
             * Set base path for resolving references.
             * If set this path will be prepended to each loaded and found reference.
             *
             * @see setTexturePath
             * @param {String} path
             *
             * @example
             *     mtlLoader.setPath( 'assets/obj/' );
             *     mtlLoader.load( 'my.mtl', ... );
             */
            setPath: function(path) {
        
                this.path = path;
        
            },
        
            /**
             * Set base path for resolving texture references.
             * If set this path will be prepended found texture reference.
             * If not set and setPath is, it will be used as texture base path.
             *
             * @see setPath
             * @param {String} path
             *
             * @example
             *     mtlLoader.setPath( 'assets/obj/' );
             *     mtlLoader.setTexturePath( 'assets/textures/' );
             *     mtlLoader.load( 'my.mtl', ... );
             */
            setTexturePath: function(path) {
        
                this.texturePath = path;
        
            },
        
            setBaseUrl: function(path) {
        
                console.warn('THREE.MTLLoader: .setBaseUrl() is deprecated. Use .setTexturePath( path ) for texture path or .setPath( path ) for general base path instead.');
        
                this.setTexturePath(path);
        
            },
        
            setCrossOrigin: function(value) {
        
                this.crossOrigin = value;
        
            },
        
            setMaterialOptions: function(value) {
        
                this.materialOptions = value;
        
            },
        
            /**
             * Parses a MTL file.
             *
             * @param {String} text - Content of MTL file
             * @return {THREE.MTLLoader.MaterialCreator}
             *
             * @see setPath setTexturePath
             *
             * @note In order for relative texture references to resolve correctly
             * you must call setPath and/or setTexturePath explicitly prior to parse.
             */
            parse: function(text) {
        
                var lines = text.split('\n');
                var info = {};
                var delimiter_pattern = /\s+/;
                var materialsInfo = {};
        
                for (var i = 0; i < lines.length; i++) {
        
                    var line = lines[i];
                    line = line.trim();
        
                    if (line.length === 0 || line.charAt(0) === '#') {
        
                        // Blank line or comment ignore
                        continue;
        
                    }
        
                    var pos = line.indexOf(' ');
        
                    var key = (pos >= 0) ? line.substring(0, pos) : line;
                    key = key.toLowerCase();
        
                    var value = (pos >= 0) ? line.substring(pos + 1) : '';
                    value = value.trim();
        
                    if (key === 'newmtl') {
        
                        // New material
        
                        info = { name: value };
                        materialsInfo[value] = info;
        
                    } else if (info) {
        
                        if (key === 'ka' || key === 'kd' || key === 'ks') {
        
                            var ss = value.split(delimiter_pattern, 3);
                            info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];
        
                        } else {
        
                            info[key] = value;
        
                        }
        
                    }
        
                }
        
                var materialCreator = new THREE.MTLLoader.MaterialCreator(this.texturePath || this.path, this.materialOptions);
                materialCreator.setCrossOrigin(this.crossOrigin);
                materialCreator.setManager(this.manager);
                materialCreator.setMaterials(materialsInfo);
                return materialCreator;
        
            }
        
        };
        
        /**
         * Create a new THREE-MTLLoader.MaterialCreator
         * @param baseUrl - Url relative to which textures are loaded
         * @param options - Set of options on how to construct the materials
         *                  side: Which side to apply the material
         *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
         *                  wrap: What type of wrapping to apply for textures
         *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
         *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
         *                                Default: false, assumed to be already normalized
         *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
         *                                  Default: false
         * @constructor
         */
        
        THREE.MTLLoader.MaterialCreator = function(baseUrl, options) {
        
            this.baseUrl = baseUrl || '';
            this.options = options;
            this.materialsInfo = {};
            this.materials = {};
            this.materialsArray = [];
            this.nameLookup = {};
        
            this.side = (this.options && this.options.side) ? this.options.side : THREE.FrontSide;
            this.wrap = (this.options && this.options.wrap) ? this.options.wrap : THREE.RepeatWrapping;
        
        };
        
        THREE.MTLLoader.MaterialCreator.prototype = {
        
            constructor: THREE.MTLLoader.MaterialCreator,
        
            crossOrigin: 'Anonymous',
        
            setCrossOrigin: function(value) {
        
                this.crossOrigin = value;
        
            },
        
            setManager: function(value) {
        
                this.manager = value;
        
            },
        
            setMaterials: function(materialsInfo) {
        
                this.materialsInfo = this.convert(materialsInfo);
                this.materials = {};
                this.materialsArray = [];
                this.nameLookup = {};
        
            },
        
            convert: function(materialsInfo) {
        
                if (!this.options) return materialsInfo;
        
                var converted = {};
        
                for (var mn in materialsInfo) {
        
                    // Convert materials info into normalized form based on options
        
                    var mat = materialsInfo[mn];
        
                    var covmat = {};
        
                    converted[mn] = covmat;
        
                    for (var prop in mat) {
        
                        var save = true;
                        var value = mat[prop];
                        var lprop = prop.toLowerCase();
        
                        switch (lprop) {
        
                            case 'kd':
                            case 'ka':
                            case 'ks':
        
                                // Diffuse color (color under white light) using RGB values
        
                                if (this.options && this.options.normalizeRGB) {
        
                                    value = [value[0] / 255, value[1] / 255, value[2] / 255];
        
                                }
        
                                if (this.options && this.options.ignoreZeroRGBs) {
        
                                    if (value[0] === 0 && value[1] === 0 && value[2] === 0) {
        
                                        // ignore
        
                                        save = false;
        
                                    }
        
                                }
        
                                break;
        
                            default:
        
                                break;
        
                        }
        
                        if (save) {
        
                            covmat[lprop] = value;
        
                        }
        
                    }
        
                }
        
                return converted;
        
            },
        
            preload: function() {
        
                for (var mn in this.materialsInfo) {
        
                    this.create(mn);
        
                }
        
            },
        
            getIndex: function(materialName) {
        
                return this.nameLookup[materialName];
        
            },
        
            getAsArray: function() {
        
                var index = 0;
        
                for (var mn in this.materialsInfo) {
        
                    this.materialsArray[index] = this.create(mn);
                    this.nameLookup[mn] = index;
                    index++;
        
                }
        
                return this.materialsArray;
        
            },
        
            create: function(materialName) {
        
                if (this.materials[materialName] === undefined) {
        
                    this.createMaterial_(materialName);
        
                }
        
                return this.materials[materialName];
        
            },
        
            createMaterial_: function(materialName) {
        
                // Create material
        
                var scope = this;
                var mat = this.materialsInfo[materialName];
                var params = {
        
                    name: materialName,
                    side: this.side
        
                };
        
                function resolveURL(baseUrl, url) {
        
                    if (typeof url !== 'string' || url === '')
                        return '';
        
                    // Absolute URL
                    if (/^https?:\/\//i.test(url)) return url;
        
                    return baseUrl + url;
        
                }
        
                function setMapForType(mapType, value) {
        
                    if (params[mapType]) return; // Keep the first encountered texture
        
                    var texParams = scope.getTextureParams(value, params);
                    var map = scope.loadTexture(resolveURL(scope.baseUrl, texParams.url));
        
                    map.repeat.copy(texParams.scale);
                    map.offset.copy(texParams.offset);
        
                    map.wrapS = scope.wrap;
                    map.wrapT = scope.wrap;
        
                    params[mapType] = map;
        
                }
        
                for (var prop in mat) {
        
                    var value = mat[prop];
                    var n;
        
                    if (value === '') continue;
        
                    switch (prop.toLowerCase()) {
        
                        // Ns is material specular exponent
        
                        case 'kd':
        
                            // Diffuse color (color under white light) using RGB values
        
                            params.color = new THREE.Color().fromArray(value);
        
                            break;
        
                        case 'ks':
        
                            // Specular color (color when light is reflected from shiny surface) using RGB values
                            params.specular = new THREE.Color().fromArray(value);
        
                            break;
        
                        case 'map_kd':
        
                            // Diffuse texture map
        
                            setMapForType("map", value);
        
                            break;
        
                        case 'map_ks':
        
                            // Specular map
        
                            setMapForType("specularMap", value);
        
                            break;
        
                        case 'norm':
        
                            setMapForType("normalMap", value);
        
                            break;
        
                        case 'map_bump':
                        case 'bump':
        
                            // Bump texture map
        
                            setMapForType("bumpMap", value);
        
                            break;
        
                        case 'ns':
        
                            // The specular exponent (defines the focus of the specular highlight)
                            // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.
        
                            params.shininess = parseFloat(value);
        
                            break;
        
                        case 'd':
                            n = parseFloat(value);
        
                            if (n < 1) {
        
                                params.opacity = n;
                                params.transparent = true;
        
                            }
        
                            break;
        
                        case 'tr':
                            n = parseFloat(value);
        
                            if (n > 0) {
        
                                params.opacity = 1 - n;
                                params.transparent = true;
        
                            }
        
                            break;
        
                        default:
                            break;
        
                    }
        
                }
        
                this.materials[materialName] = new THREE.MeshPhongMaterial(params);
                return this.materials[materialName];
        
            },
        
            getTextureParams: function(value, matParams) {
        
                var texParams = {
        
                    scale: new THREE.Vector2(1, 1),
                    offset: new THREE.Vector2(0, 0)
        
                };
        
                var items = value.split(/\s+/);
                var pos;
        
                pos = items.indexOf('-bm');
        
                if (pos >= 0) {
        
                    matParams.bumpScale = parseFloat(items[pos + 1]);
                    items.splice(pos, 2);
        
                }
        
                pos = items.indexOf('-s');
        
                if (pos >= 0) {
        
                    texParams.scale.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
                    items.splice(pos, 4); // we expect 3 parameters here!
        
                }
        
                pos = items.indexOf('-o');
        
                if (pos >= 0) {
        
                    texParams.offset.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
                    items.splice(pos, 4); // we expect 3 parameters here!
        
                }
        
                texParams.url = items.join(' ').trim();
                return texParams;
        
            },
        
            loadTexture: function(url, mapping, onLoad, onProgress, onError) {
        
                var texture;
                var loader = THREE.Loader.Handlers.get(url);
                var manager = (this.manager !== undefined) ? this.manager : THREE.DefaultLoadingManager;
        
                if (loader === null) {
        
                    loader = new THREE.TextureLoader(manager);
        
                }
        
                if (loader.setCrossOrigin) loader.setCrossOrigin(this.crossOrigin);
                texture = loader.load(url, onLoad, onProgress, onError);
        
                if (mapping !== undefined) texture.mapping = mapping;
        
                return texture;
        
            }
        
        };
  },
  installOrbitControls:function(THREE){
    THREE.OrbitControls = function(object, domElement) {
        
            this.object = object;
        
            this.domElement = (domElement !== undefined) ? domElement : document;
        
            // Set to false to disable this control
            this.enabled = true;
        
            // "target" sets the location of focus, where the object orbits around
            this.target = new THREE.Vector3();
        
            // How far you can dolly in and out ( PerspectiveCamera only )
            this.minDistance = 0;
            this.maxDistance = Infinity;
        
            // How far you can zoom in and out ( OrthographicCamera only )
            this.minZoom = 0;
            this.maxZoom = Infinity;
        
            // How far you can orbit vertically, upper and lower limits.
            // Range is 0 to Math.PI radians.
            this.minPolarAngle = 0; // radians
            this.maxPolarAngle = Math.PI; // radians
        
            // How far you can orbit horizontally, upper and lower limits.
            // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
            this.minAzimuthAngle = -Infinity; // radians
            this.maxAzimuthAngle = Infinity; // radians
        
            // Set to true to enable damping (inertia)
            // If damping is enabled, you must call controls.update() in your animation loop
            this.enableDamping = false;
            this.dampingFactor = 0.25;
        
            // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
            // Set to false to disable zooming
            this.enableZoom = true;
            this.zoomSpeed = 1.0;
        
            // Set to false to disable rotating
            this.enableRotate = true;
            this.rotateSpeed = 1.0;
        
            // Set to false to disable panning
            this.enablePan = true;
            this.keyPanSpeed = 7.0; // pixels moved per arrow key push
        
            // Set to true to automatically rotate around the target
            // If auto-rotate is enabled, you must call controls.update() in your animation loop
            this.autoRotate = false;
            this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
        
            // Set to false to disable use of the keys
            this.enableKeys = true;
        
            // The four arrow keys
            this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
        
            // Mouse buttons
            this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
        
            // for reset
            this.target0 = this.target.clone();
            this.position0 = this.object.position.clone();
            this.zoom0 = this.object.zoom;
        
            //
            // public methods
            //
        
            this.getPolarAngle = function() {
        
                return spherical.phi;
        
            };
        
            this.getAzimuthalAngle = function() {
        
                return spherical.theta;
        
            };
        
            this.saveState = function() {
        
                scope.target0.copy(scope.target);
                scope.position0.copy(scope.object.position);
                scope.zoom0 = scope.object.zoom;
        
            };
        
            this.reset = function() {
        
                scope.target.copy(scope.target0);
                scope.object.position.copy(scope.position0);
                scope.object.zoom = scope.zoom0;
        
                scope.object.updateProjectionMatrix();
                scope.dispatchEvent(changeEvent);
        
                scope.update();
        
                state = STATE.NONE;
        
            };
        
            // this method is exposed, but perhaps it would be better if we can make it private...
            this.update = function() {
        
                var offset = new THREE.Vector3();
        
                // so camera.up is the orbit axis
                var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
                var quatInverse = quat.clone().inverse();
        
                var lastPosition = new THREE.Vector3();
                var lastQuaternion = new THREE.Quaternion();
        
                return function update() {
        
                    var position = scope.object.position;
        
                    offset.copy(position).sub(scope.target);
        
                    // rotate offset to "y-axis-is-up" space
                    offset.applyQuaternion(quat);
        
                    // angle from z-axis around y-axis
                    spherical.setFromVector3(offset);
        
                    if (scope.autoRotate && state === STATE.NONE) {
        
                        rotateLeft(getAutoRotationAngle());
        
                    }
        
                    spherical.theta += sphericalDelta.theta;
                    spherical.phi += sphericalDelta.phi;
        
                    // restrict theta to be between desired limits
                    spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
        
                    // restrict phi to be between desired limits
                    spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
        
                    spherical.makeSafe();
        
        
                    spherical.radius *= scale;
        
                    // restrict radius to be between desired limits
                    spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
        
                    // move target to panned location
                    scope.target.add(panOffset);
        
                    offset.setFromSpherical(spherical);
        
                    // rotate offset back to "camera-up-vector-is-up" space
                    offset.applyQuaternion(quatInverse);
        
                    position.copy(scope.target).add(offset);
        
                    scope.object.lookAt(scope.target);
        
                    if (scope.enableDamping === true) {
        
                        sphericalDelta.theta *= (1 - scope.dampingFactor);
                        sphericalDelta.phi *= (1 - scope.dampingFactor);
        
                    } else {
        
                        sphericalDelta.set(0, 0, 0);
        
                    }
        
                    scale = 1;
                    panOffset.set(0, 0, 0);
        
                    // update condition is:
                    // min(camera displacement, camera rotation in radians)^2 > EPS
                    // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        
                    if (zoomChanged ||
                        lastPosition.distanceToSquared(scope.object.position) > EPS ||
                        8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
        
                        scope.dispatchEvent(changeEvent);
        
                        lastPosition.copy(scope.object.position);
                        lastQuaternion.copy(scope.object.quaternion);
                        zoomChanged = false;
        
                        return true;
        
                    }
        
                    return false;
        
                };
        
            }();
        
            this.dispose = function() {
        
                scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
                scope.domElement.removeEventListener('mousedown', onMouseDown, false);
                scope.domElement.removeEventListener('wheel', onMouseWheel, false);
        
                scope.domElement.removeEventListener('touchstart', onTouchStart, false);
                scope.domElement.removeEventListener('touchend', onTouchEnd, false);
                scope.domElement.removeEventListener('touchmove', onTouchMove, false);
        
                document.removeEventListener('mousemove', onMouseMove, false);
                document.removeEventListener('mouseup', onMouseUp, false);
        
                window.removeEventListener('keydown', onKeyDown, false);
        
                //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
        
            };
        
            //
            // internals
            //
        
            var scope = this;
        
            var changeEvent = { type: 'change' };
            var startEvent = { type: 'start' };
            var endEvent = { type: 'end' };
        
            var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
        
            var state = STATE.NONE;
        
            var EPS = 0.000001;
        
            // current position in spherical coordinates
            var spherical = new THREE.Spherical();
            var sphericalDelta = new THREE.Spherical();
        
            var scale = 1;
            var panOffset = new THREE.Vector3();
            var zoomChanged = false;
        
            var rotateStart = new THREE.Vector2();
            var rotateEnd = new THREE.Vector2();
            var rotateDelta = new THREE.Vector2();
        
            var panStart = new THREE.Vector2();
            var panEnd = new THREE.Vector2();
            var panDelta = new THREE.Vector2();
        
            var dollyStart = new THREE.Vector2();
            var dollyEnd = new THREE.Vector2();
            var dollyDelta = new THREE.Vector2();
        
            function getAutoRotationAngle() {
        
                return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
        
            }
        
            function getZoomScale() {
        
                return Math.pow(0.95, scope.zoomSpeed);
        
            }
        
            function rotateLeft(angle) {
        
                sphericalDelta.theta -= angle;
        
            }
        
            function rotateUp(angle) {
        
                sphericalDelta.phi -= angle;
        
            }
        
            var panLeft = function() {
        
                var v = new THREE.Vector3();
        
                return function panLeft(distance, objectMatrix) {
        
                    v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
                    v.multiplyScalar(-distance);
        
                    panOffset.add(v);
        
                };
        
            }();
        
            var panUp = function() {
        
                var v = new THREE.Vector3();
        
                return function panUp(distance, objectMatrix) {
        
                    v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
                    v.multiplyScalar(distance);
        
                    panOffset.add(v);
        
                };
        
            }();
        
            // deltaX and deltaY are in pixels; right and down are positive
            var pan = function() {
        
                var offset = new THREE.Vector3();
        
                return function pan(deltaX, deltaY) {
        
                    var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        
                    if (scope.object.isPerspectiveCamera) {
        
                        // perspective
                        var position = scope.object.position;
                        offset.copy(position).sub(scope.target);
                        var targetDistance = offset.length();
        
                        // half of the fov is center to top of screen
                        targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
        
                        // we actually don't use screenWidth, since perspective camera is fixed to screen height
                        panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
                        panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
        
                    } else if (scope.object.isOrthographicCamera) {
        
                        // orthographic
                        panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
                        panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
        
                    } else {
        
                        // camera neither orthographic nor perspective
                        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                        scope.enablePan = false;
        
                    }
        
                };
        
            }();
        
            function dollyIn(dollyScale) {
        
                if (scope.object.isPerspectiveCamera) {
        
                    scale /= dollyScale;
        
                } else if (scope.object.isOrthographicCamera) {
        
                    scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
                    scope.object.updateProjectionMatrix();
                    zoomChanged = true;
        
                } else {
        
                    console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                    scope.enableZoom = false;
        
                }
        
            }
        
            function dollyOut(dollyScale) {
        
                if (scope.object.isPerspectiveCamera) {
        
                    scale *= dollyScale;
        
                } else if (scope.object.isOrthographicCamera) {
        
                    scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
                    scope.object.updateProjectionMatrix();
                    zoomChanged = true;
        
                } else {
        
                    console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                    scope.enableZoom = false;
        
                }
        
            }
        
            //
            // event callbacks - update the object state
            //
        
            function handleMouseDownRotate(event) {
        
                //console.log( 'handleMouseDownRotate' );
        
                rotateStart.set(event.clientX, event.clientY);
        
            }
        
            function handleMouseDownDolly(event) {
        
                //console.log( 'handleMouseDownDolly' );
        
                dollyStart.set(event.clientX, event.clientY);
        
            }
        
            function handleMouseDownPan(event) {
        
                //console.log( 'handleMouseDownPan' );
        
                panStart.set(event.clientX, event.clientY);
        
            }
        
            function handleMouseMoveRotate(event) {
        
                //console.log( 'handleMouseMoveRotate' );
        
                rotateEnd.set(event.clientX, event.clientY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
        
                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        
                // rotating across whole screen goes 360 degrees around
                rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
        
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
        
                rotateStart.copy(rotateEnd);
        
                scope.update();
        
            }
        
            function handleMouseMoveDolly(event) {
        
                //console.log( 'handleMouseMoveDolly' );
        
                dollyEnd.set(event.clientX, event.clientY);
        
                dollyDelta.subVectors(dollyEnd, dollyStart);
        
                if (dollyDelta.y > 0) {
        
                    dollyIn(getZoomScale());
        
                } else if (dollyDelta.y < 0) {
        
                    dollyOut(getZoomScale());
        
                }
        
                dollyStart.copy(dollyEnd);
        
                scope.update();
        
            }
        
            function handleMouseMovePan(event) {
        
                //console.log( 'handleMouseMovePan' );
        
                panEnd.set(event.clientX, event.clientY);
        
                panDelta.subVectors(panEnd, panStart);
        
                pan(panDelta.x, panDelta.y);
        
                panStart.copy(panEnd);
        
                scope.update();
        
            }
        
            function handleMouseUp(event) {
        
                // console.log( 'handleMouseUp' );
        
            }
        
            function handleMouseWheel(event) {
        
                // console.log( 'handleMouseWheel' );
        
                if (event.deltaY < 0) {
        
                    dollyOut(getZoomScale());
        
                } else if (event.deltaY > 0) {
        
                    dollyIn(getZoomScale());
        
                }
        
                scope.update();
        
            }
        
            function handleKeyDown(event) {
        
                //console.log( 'handleKeyDown' );
        
                switch (event.keyCode) {
        
                    case scope.keys.UP:
                        pan(0, scope.keyPanSpeed);
                        scope.update();
                        break;
        
                    case scope.keys.BOTTOM:
                        pan(0, -scope.keyPanSpeed);
                        scope.update();
                        break;
        
                    case scope.keys.LEFT:
                        pan(scope.keyPanSpeed, 0);
                        scope.update();
                        break;
        
                    case scope.keys.RIGHT:
                        pan(-scope.keyPanSpeed, 0);
                        scope.update();
                        break;
        
                }
        
            }
        
            function handleTouchStartRotate(event) {
        
                //console.log( 'handleTouchStartRotate' );
        
                rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        
            }
        
            function handleTouchStartDolly(event) {
        
                //console.log( 'handleTouchStartDolly' );
        
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
        
                var distance = Math.sqrt(dx * dx + dy * dy);
        
                dollyStart.set(0, distance);
        
            }
        
            function handleTouchStartPan(event) {
        
                //console.log( 'handleTouchStartPan' );
        
                panStart.set(event.touches[0].pageX, event.touches[0].pageY);
        
            }
        
            function handleTouchMoveRotate(event) {
        
                //console.log( 'handleTouchMoveRotate' );
        
                rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
        
                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        
                // rotating across whole screen goes 360 degrees around
                rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
        
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
        
                rotateStart.copy(rotateEnd);
        
                scope.update();
        
            }
        
            function handleTouchMoveDolly(event) {
        
                //console.log( 'handleTouchMoveDolly' );
        
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
        
                var distance = Math.sqrt(dx * dx + dy * dy);
        
                dollyEnd.set(0, distance);
        
                dollyDelta.subVectors(dollyEnd, dollyStart);
        
                if (dollyDelta.y > 0) {
        
                    dollyOut(getZoomScale());
        
                } else if (dollyDelta.y < 0) {
        
                    dollyIn(getZoomScale());
        
                }
        
                dollyStart.copy(dollyEnd);
        
                scope.update();
        
            }
        
            function handleTouchMovePan(event) {
        
                //console.log( 'handleTouchMovePan' );
        
                panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        
                panDelta.subVectors(panEnd, panStart);
        
                pan(panDelta.x, panDelta.y);
        
                panStart.copy(panEnd);
        
                scope.update();
        
            }
        
            function handleTouchEnd(event) {
        
                //console.log( 'handleTouchEnd' );
        
            }
        
            //
            // event handlers - FSM: listen for events and reset state
            //
        
            function onMouseDown(event) {
        
                if (scope.enabled === false) return;
        
                event.preventDefault();
        
                switch (event.button) {
        
                    case scope.mouseButtons.ORBIT:
        
                        if (scope.enableRotate === false) return;
        
                        handleMouseDownRotate(event);
        
                        state = STATE.ROTATE;
        
                        break;
        
                    case scope.mouseButtons.ZOOM:
        
                        if (scope.enableZoom === false) return;
        
                        handleMouseDownDolly(event);
        
                        state = STATE.DOLLY;
        
                        break;
        
                    case scope.mouseButtons.PAN:
        
                        if (scope.enablePan === false) return;
        
                        handleMouseDownPan(event);
        
                        state = STATE.PAN;
        
                        break;
        
                }
        
                if (state !== STATE.NONE) {
        
                    document.addEventListener('mousemove', onMouseMove, false);
                    document.addEventListener('mouseup', onMouseUp, false);
        
                    scope.dispatchEvent(startEvent);
        
                }
        
            }
        
            function onMouseMove(event) {
        
                if (scope.enabled === false) return;
        
                event.preventDefault();
        
                switch (state) {
        
                    case STATE.ROTATE:
        
                        if (scope.enableRotate === false) return;
        
                        handleMouseMoveRotate(event);
        
                        break;
        
                    case STATE.DOLLY:
        
                        if (scope.enableZoom === false) return;
        
                        handleMouseMoveDolly(event);
        
                        break;
        
                    case STATE.PAN:
        
                        if (scope.enablePan === false) return;
        
                        handleMouseMovePan(event);
        
                        break;
        
                }
        
            }
        
            function onMouseUp(event) {
        
                if (scope.enabled === false) return;
        
                handleMouseUp(event);
        
                document.removeEventListener('mousemove', onMouseMove, false);
                document.removeEventListener('mouseup', onMouseUp, false);
        
                scope.dispatchEvent(endEvent);
        
                state = STATE.NONE;
        
            }
        
            function onMouseWheel(event) {
        
                if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
        
                event.preventDefault();
                event.stopPropagation();
        
                handleMouseWheel(event);
        
                scope.dispatchEvent(startEvent); // not sure why these are here...
                scope.dispatchEvent(endEvent);
        
            }
        
            function onKeyDown(event) {
        
                if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;
        
                handleKeyDown(event);
        
            }
        
            function onTouchStart(event) {
        
                if (scope.enabled === false) return;
        
                switch (event.touches.length) {
        
                    case 1: // one-fingered touch: rotate
        
                        if (scope.enableRotate === false) return;
        
                        handleTouchStartRotate(event);
        
                        state = STATE.TOUCH_ROTATE;
        
                        break;
        
                    case 2: // two-fingered touch: dolly
        
                        if (scope.enableZoom === false) return;
        
                        handleTouchStartDolly(event);
        
                        state = STATE.TOUCH_DOLLY;
        
                        break;
        
                    case 3: // three-fingered touch: pan
        
                        if (scope.enablePan === false) return;
        
                        handleTouchStartPan(event);
        
                        state = STATE.TOUCH_PAN;
        
                        break;
        
                    default:
        
                        state = STATE.NONE;
        
                }
        
                if (state !== STATE.NONE) {
        
                    scope.dispatchEvent(startEvent);
        
                }
        
            }
        
            function onTouchMove(event) {
        
                if (scope.enabled === false) return;
        
                event.preventDefault();
                event.stopPropagation();
        
                switch (event.touches.length) {
        
                    case 1: // one-fingered touch: rotate
        
                        if (scope.enableRotate === false) return;
                        if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...
        
                        handleTouchMoveRotate(event);
        
                        break;
        
                    case 2: // two-fingered touch: dolly
        
                        if (scope.enableZoom === false) return;
                        if (state !== STATE.TOUCH_DOLLY) return; // is this needed?...
        
                        handleTouchMoveDolly(event);
        
                        break;
        
                    case 3: // three-fingered touch: pan
        
                        if (scope.enablePan === false) return;
                        if (state !== STATE.TOUCH_PAN) return; // is this needed?...
        
                        handleTouchMovePan(event);
        
                        break;
        
                    default:
        
                        state = STATE.NONE;
        
                }
        
            }
        
            function onTouchEnd(event) {
        
                if (scope.enabled === false) return;
        
                handleTouchEnd(event);
        
                scope.dispatchEvent(endEvent);
        
                state = STATE.NONE;
        
            }
        
            function onContextMenu(event) {
        
                if (scope.enabled === false) return;
        
                event.preventDefault();
        
            }
        
            //
        
            scope.domElement.addEventListener('contextmenu', onContextMenu, false);
        
            scope.domElement.addEventListener('mousedown', onMouseDown, false);
            scope.domElement.addEventListener('wheel', onMouseWheel, false);
        
            scope.domElement.addEventListener('touchstart', onTouchStart, false);
            scope.domElement.addEventListener('touchend', onTouchEnd, false);
            scope.domElement.addEventListener('touchmove', onTouchMove, false);
        
            window.addEventListener('keydown', onKeyDown, false);
        
            // force an update at start
        
            this.update();
        
        };
        
        THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
        THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
        
        Object.defineProperties(THREE.OrbitControls.prototype, {
        
            center: {
        
                get: function() {
        
                    console.warn('THREE.OrbitControls: .center has been renamed to .target');
                    return this.target;
        
                }
        
            },
        
            // backward compatibility
        
            noZoom: {
        
                get: function() {
        
                    console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
                    return !this.enableZoom;
        
                },
        
                set: function(value) {
        
                    console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
                    this.enableZoom = !value;
        
                }
        
            },
        
            noRotate: {
        
                get: function() {
        
                    console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
                    return !this.enableRotate;
        
                },
        
                set: function(value) {
        
                    console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
                    this.enableRotate = !value;
        
                }
        
            },
        
            noPan: {
        
                get: function() {
        
                    console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
                    return !this.enablePan;
        
                },
        
                set: function(value) {
        
                    console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
                    this.enablePan = !value;
        
                }
        
            },
        
            noKeys: {
        
                get: function() {
        
                    console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
                    return !this.enableKeys;
        
                },
        
                set: function(value) {
        
                    console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
                    this.enableKeys = !value;
        
                }
        
            },
        
            staticMoving: {
        
                get: function() {
        
                    console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
                    return !this.enableDamping;
        
                },
        
                set: function(value) {
        
                    console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
                    this.enableDamping = !value;
        
                }
        
            },
        
            dynamicDampingFactor: {
        
                get: function() {
        
                    console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
                    return this.dampingFactor;
        
                },
        
                set: function(value) {
        
                    console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
                    this.dampingFactor = value;
        
                }
        
            }
        
        });
  }
}
if (typeof window !== 'undefined' && THREE) {
    THREEAll.installDDSLoader(THREE);
    THREEAll.installOBJLoader(THREE);
    THREEAll.installMTLLoader(THREE);
    THREEAll.installOrbitControls(THREE);
  }

export default THREE
  