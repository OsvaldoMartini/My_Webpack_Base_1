<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:janes="http://dtd.janes.com/2002/Content/"
                xmlns:func="http://example.com/">

  <xsl:output omit-xml-declaration="yes" />

  <xsl:variable name="parentId">
    <root>
      <xsl:for-each select="distinct-values(//itemLinks/itemLink/parentIdentifier/text())">
        <parent>
          <parentId>
            <xsl:value-of select="." />
          </parentId>
          <columnNo>
            <xsl:value-of select="position()"/>
          </columnNo>
        </parent>
      </xsl:for-each>
    </root>
  </xsl:variable>

  <xsl:variable name="sortList">
    <root>
      <item>Guns</item>
      <item>Rockets</item>
      <item>Bombs</item>
      <item>Missiles</item>
      <item>Torpedoes</item>
      <item>Sea mines</item>
      <item>Weapon/fire control</item>
      <item>Ancillary</item>
      <item>Turrets/weapon stations</item>
      <item>Launcher</item>
      <item>Other weapons</item>
      <item>Propulsion</item>
      <item>C2 &amp; combat management</item>
      <item>Communications</item>
      <item>Other mission systems</item>
      <item>Mission suites</item>
      <item>Electro-optics</item>
      <item>Electronic warfare</item>
      <item>Remote guidance &amp; control</item>
      <item>Navigation</item>
      <item>Radar</item>
      <item>Sonar</item>
      <item>Identification</item>
      <item>Land platform</item>
      <item>Air platforms</item>
      <item>Sea Platform</item>
      <item>Physical countermeasures</item>
      <item>CBRN protection</item>
      <item>Unmanned air platforms</item>
      <item>Unmanned sea platforms</item>
    </root>
  </xsl:variable>

  <!-- DOCUMENT -->
  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="root">
    <xsl:choose>
      <xsl:when test="not(count(itemLinks/itemLink) > 0)">
        <xsl:element name="div">
          <xsl:attribute name="class">
            alert alert-info text-center
          </xsl:attribute>
          <xsl:text>
            No weapons or sub-systems could be found for this piece of equipment.
          </xsl:text>
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:element name="div">
          <xsl:call-template name="equipment" />
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="equipment">
    <xsl:variable name="columnCount" select="count(//itemLinks)"></xsl:variable>

    <xsl:for-each-group select="//itemLink" group-by="childType">

      <xsl:sort select="number(func:getSortValue(current-grouping-key()))" data-type="number" order="ascending"></xsl:sort>

      <xsl:element name="p">
        <xsl:attribute name="class">icon-collapse-arrow hand relative</xsl:attribute>
        <xsl:attribute name="style">margin: 0.2em 0.2em -0.15em;</xsl:attribute>
        <xsl:attribute name="data-toggle">collapse</xsl:attribute>
        <xsl:attribute name="href">#collapse<xsl:value-of select="concat(parentIdentifier, replace(childType, '[^a-zA-Z]', ''))" /></xsl:attribute>
        <xsl:attribute name="aria-expanded">false</xsl:attribute>
        <xsl:value-of select="childType" />
      </xsl:element>

      <xsl:element name="div">
        <xsl:attribute name="class">collapse</xsl:attribute>
        <xsl:attribute name="id">collapse<xsl:value-of select="concat(parentIdentifier, replace(childType, '[^a-zA-Z]', ''))" /></xsl:attribute>

        <xsl:element name="div">
          <xsl:attribute name="class">grid</xsl:attribute>

          <xsl:for-each select="$parentId/root/parent">
            
            <xsl:variable name="equipmentId" select="parentId" />

            <xsl:element name="div">
              <xsl:attribute name="id"><xsl:value-of select="parentId"/></xsl:attribute>
              <xsl:attribute name="class">grid-1-<xsl:value-of select="$columnCount"/></xsl:attribute>

              <xsl:choose>
                <xsl:when test="current-group()/parentIdentifier = $equipmentId">

                  <xsl:element name="div">
                    <xsl:attribute name="class">u-bold u-padding-Axs</xsl:attribute>
                    <xsl:value-of select="(current-group()[parentIdentifier = $equipmentId]/parentDisplayName)[1]"/>
                  </xsl:element>

                  <xsl:for-each select="current-group()[parentIdentifier = $equipmentId]">
                    <xsl:element name="p">
                      <xsl:attribute name="class">icon-collapse-arrow hand indent u-padding-Axxs relative</xsl:attribute>
                      <xsl:attribute name="data-toggle">collapse</xsl:attribute>
                      <xsl:attribute name="href">#collapse<xsl:value-of select="concat(parentIdentifier, childIdentifier)" /></xsl:attribute>
                      <xsl:attribute name="aria-expanded">false</xsl:attribute>
                      <xsl:value-of select="childDisplayName" />
                      <xsl:apply-templates select="childQuantity" />
                    </xsl:element>

                    <xsl:element name="div">
                      <xsl:attribute name="class">collapse indent</xsl:attribute>
                      <xsl:attribute name="id">collapse<xsl:value-of select="concat(parentIdentifier, childIdentifier)" /></xsl:attribute>
                      <xsl:element name="ul">
                        <xsl:apply-templates select="./childDisplayName" />
                        <xsl:apply-templates select="./childStatus" />
                        <xsl:apply-templates select="./fit" />
                        <xsl:apply-templates select="./countries" />
                      </xsl:element>
                    </xsl:element>
                  </xsl:for-each>

                </xsl:when>
              <xsl:otherwise>
                <div></div>
              </xsl:otherwise>
            </xsl:choose>

            </xsl:element>

          </xsl:for-each>

        </xsl:element>
      </xsl:element>
    </xsl:for-each-group>
  </xsl:template>

  <!-- MATCH TEMPLATES -->
  <!-- TODO: option label if data exists -->
  <xsl:template match="childStatus">
    <xsl:element name="li">
      <xsl:element name="span">Status: </xsl:element>
      <xsl:element name="span">
        <xsl:apply-templates />
      </xsl:element>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="fit">
    <xsl:element name="li">
      <xsl:element name="span">Fit: </xsl:element>
      <xsl:element name="span">
        <xsl:apply-templates />
      </xsl:element>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="childQuantity">
    <xsl:element name="span">
      <xsl:attribute name="class">badge u-margin-Hxs</xsl:attribute>
      <xsl:apply-templates />
    </xsl:element>
  </xsl:template>

  <xsl:template match="childDisplayName">
    <xsl:element name="li">
      <xsl:element name="span">
        <xsl:choose>
          <xsl:when test="./preceding-sibling::childIdentifier">
            <xsl:element name="a">
              <xsl:attribute name="href">
                /equipment/explore/<xsl:value-of select="./preceding-sibling::childIdentifier[1]"/>
              </xsl:attribute>
              <xsl:attribute name="target">_blank</xsl:attribute>
              <xsl:value-of select="."/>
              <xsl:element name="i">
                <xsl:attribute name="class">icon-link-ext u-margin-Lxs grey2</xsl:attribute>
                <xsl:attribute name="role">presentation</xsl:attribute>
              </xsl:element>
            </xsl:element>
          </xsl:when>
          <xsl:otherwise>
            <xsl:element name="span">
              <xsl:value-of select="."/>
            </xsl:element>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="countries">
    <xsl:element name="li">
      <xsl:element name="span">Countries: </xsl:element>
      <xsl:element name="span">
        <xsl:element name="ul">
          <xsl:apply-templates/>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="country">
    <xsl:element name="li">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:function name="func:getSortValue">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="$sortList/root/item[. = $string]">
        <xsl:value-of select="$sortList/root/item[. = $string]/count(preceding-sibling::item)" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="99999"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:function>

</xsl:stylesheet>
