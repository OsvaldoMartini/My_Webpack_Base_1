<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:janes="http://dtd.janes.com/2002/Content/" xmlns:xs="http://www.w3.org/2001/XMLSchema" >
  <xsl:output omit-xml-declaration="yes" />

  <xsl:variable name="stringLookups">
    <root>
      <!-- METADATA TOP -->
      <string language="en" type="metadatatop" key="mlTitle">Title</string>
      <string language="en" type="metadatatop" key="mlParent">Parent</string>
      <!-- NAVS -->
      <string language="en" type="nav" key="environment">Environment</string>
      <string language="en" type="nav" key="type">Type</string>
      <string language="en" type="nav" key="role">Role</string>
      <string language="en" type="nav" key="descriptor">Descriptor</string>
      <string language="en" type="nav" key="operatingprofilepath">Operating Profile Path</string>
      <string language="en" type="nav" key="weapontype">Weapon Type</string>
      <string language="en" type="nav" key="weapondescriptor">Weapon Descriptor</string>
      <string language="en" type="nav" key="weaponrole">Weapon Role</string>
      <string language="en" type="nav" key="weaponguidance">Weapon Guidance</string>
      <string language="en" type="nav" key="user">User(s)</string>
      <string language="en" type="nav" key="airplatformtype">Air Platform Type</string>
      <string language="en" type="nav" key="airplatformsubtype">Air Platform Sub Type</string>
      <string language="en" type="nav" key="airplatformrole">Air Platform Role</string>
      <string language="en" type="nav" key="airplatformrolesubtype">Air Platform Role Sub Type</string>
      <string language="en" type="nav" key="nodetype">Node Type</string>
      <string language="en" type="nav" key="entitytype">Entity Type</string>
      <string language="en" type="nav" key="landplatformtype">Land Platform Type</string>
      <string language="en" type="nav" key="landplatformrole">Land Platform Role</string>
      <string language="en" type="nav" key="landplatformdescriptor">Land Platform Descriptor</string>
      <string language="en" type="nav" key="weaponsubtype">Weapon Subtype</string>
      <string language="en" type="nav" key="missionsystemtype">Mission System Type</string>
      <string language="en" type="nav" key="missionsystemrole">Mission System Role</string>
      <string language="en" type="nav" key="missionsystemsubrole">Mission System Sub Role</string>
      <string language="en" type="nav" key="operatingprofilepath">Operating Profile Path</string>
      <string language="en" type="nav" key="operatorcountry">Operated By</string>
      <string language="en" type="nav" key="weaponoperation">Weapon Operation</string>
      <string language="en" type="nav" key="mobility">Mobility</string>
      <string language="en" type="nav" key="operation">Operation(s)</string>
      <string language="en" type="nav" key="landplatformprotection">Land Platform Protection</string>
      <string language="en" type="nav" key="landplatformmobility">Land Platform Mobility</string>
      <string language="en" type="nav" key="propulsiontype">Propulsion Type</string>
      <!-- METADATA BOTTOM -->
      <string language="en" type="metadatabottom" key="mlDocuments"></string>
      <string language="en" type="metadataexplorer" key="mlUID"></string>
    </root>
  </xsl:variable>

  <xsl:variable name="columnCount" as="xs:integer">
    <xsl:value-of select="count(/root/mlEnvelope)"/>
  </xsl:variable>

  <xsl:variable name="envelope">
    <root>
      <xsl:copy-of select="//mlEnvelope"/>
    </root>
  </xsl:variable>

  <!-- IGNORE LIST -->
  <xsl:template match="*"/>

  <!-- APPLY TEMPLATES -->
  <xsl:template match="/">
    <xsl:element name="table">
      <xsl:attribute name="class">table</xsl:attribute>
      <xsl:element name="tbody">
        <xsl:apply-templates select="$stringLookups/root/string">
          <xsl:with-param name="envelopes">
            <xsl:copy-of select="$envelope"/>
          </xsl:with-param>
        </xsl:apply-templates>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="string">
    <xsl:param name="envelopes">
      <root></root>
    </xsl:param>
    <xsl:variable name="elementName">
      <xsl:value-of select="@key"/>
    </xsl:variable>
    <xsl:variable name="type">
      <xsl:value-of select="@type"/>
    </xsl:variable>
    <xsl:if test="$envelopes//mlEnvelope/mlMetaData/*[local-name() = $elementName][. != ''] or
                  $envelopes//mlEnvelope/mlNavs/mlNav[@name = $elementName]/node">
      <xsl:element name="tr">
        <xsl:attribute name="style">display: table; width: 100%; table-layout: fixed</xsl:attribute>
        <xsl:choose>
          <xsl:when test="$type = 'metadatatop'">
            <xsl:element name="td">
              <xsl:apply-templates/>
            </xsl:element>
            <xsl:for-each select="$envelopes//mlEnvelope">
              <xsl:element name="td">
                <xsl:value-of select="mlMetaData/*[local-name() = $elementName]"/>
              </xsl:element>
            </xsl:for-each>
          </xsl:when>
          <xsl:when test="$type = 'nav'">
            <xsl:element name="td">
              <xsl:apply-templates/>
            </xsl:element>
            <xsl:for-each select="$envelopes//mlEnvelope">
              <xsl:element name="td">
                <xsl:apply-templates select="mlNavs/mlNav[@name = $elementName]/node"/>
              </xsl:element>
            </xsl:for-each>
          </xsl:when>
          <xsl:when test="$type = 'metadatabottom'">
            <xsl:for-each-group select="$envelopes//mlEnvelope/mlMetaData/mlDocuments/document" group-by="concat(documentId, '%', documentTitle)">
              <xsl:apply-templates select="current-group()[1]"/>
            </xsl:for-each-group>
            <!--<xsl:apply-templates select="mlMetaData/mlUID"/>-->
          </xsl:when>
          <xsl:when test="$type = 'metadataexplorer'">
            <xsl:apply-templates select="$envelopes//mlEnvelope/mlMetaData/mlUID" />
          </xsl:when>
        </xsl:choose>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <xsl:template match="node">
    <xsl:apply-templates/>
    <xsl:if test="following-sibling::node">
      <xsl:element name="br"/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="mlDocuments">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="document">
    <xsl:element name="tr">
      <xsl:attribute name="style">display: table; width: 100%; table-layout: fixed</xsl:attribute>
      <xsl:element name="td">
        <xsl:attribute name="colspan">2</xsl:attribute>
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:text>/DefenceEquipment/Display/</xsl:text>
            <xsl:value-of select="documentId"/>
            <xsl:text>?highlights=</xsl:text>
            <xsl:value-of select="//mlTitle"/>
          </xsl:attribute>
          <xsl:attribute name="target">_blank</xsl:attribute>
          <xsl:value-of select="documentTitle"/>
          <xsl:element name="i">
            <xsl:attribute name="class">icon-link-ext u-margin-Lxs grey2</xsl:attribute>
            <xsl:attribute name="role">presentation</xsl:attribute>
          </xsl:element>
          <xsl:element name="i">
            <xsl:attribute name="class">icon-right-open pull-right</xsl:attribute>
            <xsl:attribute name="role">presentation</xsl:attribute>
          </xsl:element>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="mlUID">
    <xsl:element name="tr">
      <xsl:attribute name="style">display: table; width: 100%; table-layout: fixed</xsl:attribute>
      <xsl:attribute name="class">
        <xsl:text>equipment-explorer-link</xsl:text>
      </xsl:attribute>
      <xsl:element name="td">
        <xsl:attribute name="colspan">2</xsl:attribute>
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:text>/equipment/explore/</xsl:text>
            <xsl:value-of select="."/>
          </xsl:attribute>
          <xsl:attribute name="target">_blank</xsl:attribute>
          <xsl:text>Equipment Explorer</xsl:text>
          <xsl:element name="i">
            <xsl:attribute name="class">icon-link-ext u-margin-Lxs grey2</xsl:attribute>
            <xsl:attribute name="role">presentation</xsl:attribute>
          </xsl:element>
          <xsl:element name="i">
            <xsl:attribute name="class">icon-right-open pull-right</xsl:attribute>
            <xsl:attribute name="role">presentation</xsl:attribute>
          </xsl:element>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
